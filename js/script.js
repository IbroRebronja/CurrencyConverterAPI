document.getElementById('converter-form').addEventListener('submit', function(e) {
    e.preventDefault();

    let amount = document.getElementById('amount').value;
    let fromCurrency = document.getElementById('from-currency').value;
    let toCurrency = document.getElementById('to-currency').value;

    // Hardcoded exchange rates (you can replace with API data later)
    const exchangeRates = {
        'USD': { 'EUR': 0.92, 'GBP': 0.75, 'JPY': 134.5, 'AUD': 1.48 },
        'EUR': { 'USD': 1.09, 'GBP': 0.82, 'JPY': 146.5, 'AUD': 1.61 },
        'GBP': { 'USD': 1.33, 'EUR': 1.22, 'JPY': 178.6, 'AUD': 1.96 },
        'JPY': { 'USD': 0.0074, 'EUR': 0.0068, 'GBP': 0.0056, 'AUD': 0.011 },
        'AUD': { 'USD': 0.68, 'EUR': 0.62, 'GBP': 0.51, 'JPY': 91.5 },
    };

    // Calculate conversion
    if (amount && fromCurrency && toCurrency) {
        let rate = exchangeRates[fromCurrency][toCurrency];
        let convertedAmount = (amount * rate).toFixed(2);

        // Show result
        document.getElementById('result').innerHTML = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
    } else {
        document.getElementById('result').innerHTML = 'Please enter a valid amount and select currencies.';
    }
});
