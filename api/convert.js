const fetch = require('node-fetch');

export default async function handler(req, res) {
  const { fromCurrency, toCurrency, amount, list } = req.query;
  const apiKey = process.env.ExchangeRateAPI;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing' });
  }

  // If the query parameter "list" is set to true, return the currency list.
  if (list === 'true') {
    try {
      // Try using the primary endpoint from ExchangeRate-API
      const primaryListUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
      const primaryResponse = await fetch(primaryListUrl);
      const primaryData = await primaryResponse.json();
      console.log('Primary currency list response:', primaryData);
      
      if (primaryData.result === 'success' && primaryData.conversion_rates) {
        const currencies = Object.keys(primaryData.conversion_rates);
        return res.status(200).json({ currencies });
      } else {
        // If primary endpoint doesn't return success, throw an error to trigger fallback
        throw new Error('Primary endpoint failed');
      }
    } catch (error) {
      console.error('Primary currency list fetch error:', error);
      // Fallback endpoint using ExchangeRate.host
      try {
        const altListUrl = 'https://api.exchangerate.host/symbols';
        const altResponse = await fetch(altListUrl);
        const altData = await altResponse.json();
        console.log('Alternate currency list response:', altData);
        
        if (!altData.symbols) {
          return res.status(500).json({ error: 'Unable to fetch currency list from fallback endpoint.' });
        }
        
        const currencies = Object.keys(altData.symbols);
        return res.status(200).json({ currencies });
      } catch (altError) {
        console.error('Alternate currency list fetch error:', altError);
        return res.status(500).json({ error: 'Unable to fetch currency list from fallback endpoint.' });
      }
    }
  }

  // If we're not fetching the list, we proceed with the conversion.
  if (!fromCurrency || !toCurrency || !amount) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // Fetch the exchange rates for the base currency (fromCurrency)
    const conversionUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
    const conversionResponse = await fetch(conversionUrl);
    const conversionData = await conversionResponse.json();
    
    if (conversionData.result !== 'success') {
      return res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
    
    // Validate that the target currency exists
    if (!(toCurrency in conversionData.conversion_rates)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }
    
    const rate = conversionData.conversion_rates[toCurrency];
    const convertedAmount = (amount * rate).toFixed(2);
    return res.status(200).json({ convertedAmount });
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
