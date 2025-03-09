export default async function handler(req, res) {
    const { fromCurrency, toCurrency, amount, list } = req.query;

    if (list === 'true') {
        const currencyListUrl = `https://openexchangerates.org/api/currencies.json`;
        try {
            const currencyListResponse = await fetch(currencyListUrl);
            const currencyListData = await currencyListResponse.json();
            return res.status(200).json(currencyListData); 
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch currency list', details: error.message });
        }
    }

    if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const apiKey = process.env.ExchangeRateAPI;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    try {
        const { default: fetch } = await import('node-fetch');

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
        return res.status(500).json({ error: 'Error fetching data', details: error.message });
    }
}
