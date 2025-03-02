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
      // Use the latest USD conversion rates to extract supported currency codes.
      const listUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
      const listResponse = await fetch(listUrl);
      const listData = await listResponse.json();
      
      if (listData.result !== 'success') {
        return res.status(500).json({ error: 'Unable to fetch currency list.' });
      }
      
      // The keys of conversion_rates represent the supported currency codes.
      const currencies = Object.keys(listData.conversion_rates);
      return res.status(200).json({ currencies });
    } catch (error) {
      console.error('Currency list fetch error:', error);
      return res.status(500).json({ error: 'Unable to fetch currency list.' });
    }
  }

  // Otherwise, proceed with conversion.
  if (!fromCurrency || !toCurrency || !amount) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // Fetch the latest exchange rates for the base currency (fromCurrency)
    const conversionUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
    const conversionResponse = await fetch(conversionUrl);
    const conversionData = await conversionResponse.json();
    
    if (conversionData.result !== 'success') {
      return res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
    
    // Validate that the toCurrency exists in the returned conversion rates.
    if (!(toCurrency in conversionData.conversion_rates)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }
    
    const rate = conversionData.conversion_rates[toCurrency];
    const convertedAmount = (amount * rate).toFixed(2);
    
    return res.status(200).json({ convertedAmount });
  } catch (error) {
    console.error('Conversion fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
