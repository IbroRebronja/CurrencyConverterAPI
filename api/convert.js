const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { fromCurrency, toCurrency, amount, list } = req.query;

    // Check if 'list=true' is passed in the query
    if (list === 'true') {
        try {
            // Fetch the list of supported currencies
            const currencyListUrl = 'https://api.exchangerate.host/symbols'; // This API returns a list of supported currencies
            const response = await fetch(currencyListUrl);
            const data = await response.json();
            
            // Return the list of supported currencies
            return res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching currency list:', error);
            return res.status(500).json({ error: 'Failed to fetch currency list' });
        }
    }

    // If 'list=true' is not passed, proceed with conversion logic
    if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const apiKey = process.env.ExchangeRateAPI;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    // Fetch the list of currencies (for validation)
    const currencyListUrl = `https://openexchangerates.org/api/currencies.json`;
    const currencyListResponse = await fetch(currencyListUrl);
    const currencyListData = await currencyListResponse.json();

    // Check if both fromCurrency and toCurrency are valid
    if (!(fromCurrency in currencyListData) || !(toCurrency in currencyListData)) {
        return res.status(400).json({ error: 'Invalid currency code' });
    }

    // Fetch the exchange rates for the fromCurrency
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
    const exchangeRatesResponse = await fetch(apiUrl);
    const exchangeRatesData = await exchangeRatesResponse.json();

    if (exchangeRatesData.result !== 'success') {
        return res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }

    // Get the conversion rate for the target currency
    const rate = exchangeRatesData.conversion_rates[toCurrency];
    if (!rate) {
        return res.status(400).json({ error: 'Invalid currency code' });
    }

    // Calculate the converted amount
    const convertedAmount = (amount * rate).toFixed(2);

    // Respond with the converted amount
    return res.status(200).json({ convertedAmount });
}
