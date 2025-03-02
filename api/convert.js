const fetch = require('node-fetch');

export default async function handler(req, res) {
    // Destructure query parameters
    const { fromCurrency, toCurrency, amount } = req.query;

    // Validate the query parameters
    if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    // Access API key from environment variables
    const apiKey = process.env.ExchangeRateAPI;  // Correct way to access the environment variable in Vercel

    // Check if the API key is defined
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    // Construct the API URL with the key
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    try {
        // Fetch exchange rates from the external API
        const response = await fetch(apiUrl);
        const data = await response.json();

        // If the API doesn't respond successfully, send an error
        if (data.result !== 'success') {
            return res.status(500).json({ error: 'Failed to fetch exchange rates' });
        }

        // Get the conversion rate for the target currency
        const rate = data.conversion_rates[toCurrency];
        if (!rate) {
            return res.status(400).json({ error: 'Invalid currency code' });
        }

        // Calculate the converted amount
        const convertedAmount = (amount * rate).toFixed(2);

        // Respond with the converted amount
        return res.status(200).json({ convertedAmount });
    } catch (error) {
        // Handle any errors during the fetch or conversion process
        return res.status(500).json({ error: 'Internal server error' });
    }
}
