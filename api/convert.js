const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { fromCurrency, toCurrency, amount, list } = req.query;

    // If the query parameter "list" is set to true, return the currency list.
    if (list === 'true') {
        try {
            // Use ExchangeRate.host symbols endpoint to fetch the list of currencies.
            const currencyListUrl = 'https://api.exchangerate.host/symbols';
            const currencyListResponse = await fetch(currencyListUrl);
            const currencyListData = await currencyListResponse.json();
            if (!currencyListData.success) {
                return res.status(500).json({ error: 'Unable to fetch currency list.' });
            }
            // Return the symbols object (keys are currency codes, values are objects with description and code)
            return res.status(200).json({ currencies: currencyListData.symbols });
        } catch (error) {
            console.error('Currency list fetch error:', error);
            return res.status(500).json({ error: 'Unable to fetch currency list.' });
        }
    }

    // For conversion, ensure all required parameters are provided.
    if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    // Get the API key from Vercel environment variables
    const apiKey = process.env.ExchangeRateAPI;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    // Validate that the provided currency codes are valid using the ExchangeRate.host currency list.
    try {
        const currencyListUrl = 'https://api.exchangerate.host/symbols';
        const currencyListResponse = await fetch(currencyListUrl);
        const currencyListData = await currencyListResponse.json();
        if (!currencyListData.success) {
            return res.status(500).json({ error: 'Unable to fetch currency list for validation.' });
        }
        if (!(fromCurrency in currencyListData.symbols) || !(toCurrency in currencyListData.symbols)) {
            return res.status(400).json({ error: 'Invalid currency code' });
        }
    } catch (error) {
        console.error('Currency validation error:', error);
        return res.status(500).json({ error: 'Unable to validate currency codes' });
    }

    // Fetch the exchange rates for the base currency from exchangerate-api.com.
    try {
        const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
        const exchangeRatesResponse = await fetch(apiUrl);
        const exchangeRatesData = await exchangeRatesResponse.json();

        if (exchangeRatesData.result !== 'success') {
            return res.status(500).json({ error: 'Failed to fetch exchange rates' });
        }

        // Get the conversion rate for the target currency.
        const rate = exchangeRatesData.conversion_rates[toCurrency];
        if (!rate) {
            return res.status(400).json({ error: 'Invalid currency code' });
        }

        // Calculate the converted amount.
        const convertedAmount = (amount * rate).toFixed(2);
        return res.status(200).json({ convertedAmount });
    } catch (error) {
        console.error('Exchange rate fetch error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
