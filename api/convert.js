const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { fromCurrency, toCurrency, amount, list } = req.query;

    // If the query param "list" is set to true, return the currency list.
    if (list === 'true') {
        try {
            const currencyListUrl = 'https://openexchangerates.org/api/currencies.json';
            const currencyListResponse = await fetch(currencyListUrl);
            const currencyListData = await currencyListResponse.json();
            return res.status(200).json({ currencies: currencyListData });
        } catch (error) {
            return res.status(500).json({ error: 'Unable to fetch currency list.' });
        }
    }

    // For conversion, ensure all required parameters are provided.
    if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const apiKey = process.env.ExchangeRateAPI;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    // Validate that the provided currency codes are valid using the currency list.
    try {
        const currencyListUrl = 'https://openexchangerates.org/api/currencies.json';
        const currencyListResponse = await fetch(currencyListUrl);
        const currencyListData = await currencyListResponse.json();
        if (!(fromCurrency in currencyListData) || !(toCurrency in currencyListData)) {
            return res.status(400).json({ error: 'Invalid currency code' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Unable to validate currency codes' });
    }

    // Fetch the exchange rates for the base currency.
    try {
        const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
        const exchangeRatesResponse = await fetch(apiUrl);
        const exchangeRatesData = await exchangeRatesResponse.json();

        if (exchangeRatesData.result !== 'success') {
            return res.status(500).json({ error: 'Failed to fetch exchange rates' });
        }

        const rate = exchangeRatesData.conversion_rates[toCurrency];
        if (!rate) {
            return res.status(400).json({ error: 'Invalid currency code' });
        }

        const convertedAmount = (amount * rate).toFixed(2);
        return res.status(200).json({ convertedAmount });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
