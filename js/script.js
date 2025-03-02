document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const resultDiv = document.getElementById('result');
    const form = document.getElementById('converter-form');

    // Fetch the list of currencies from your API endpoint.
    fetch('/api/convert?list=true')
        .then(response => response.json())
        .then(data => {
            if (data.currencies) {
                // data.currencies is an object with keys as currency codes and values as names.
                Object.keys(data.currencies).forEach(currency => {
                    const optionFrom = document.createElement('option');
                    optionFrom.value = currency;
                    optionFrom.textContent = `${currency} - ${data.currencies[currency]}`;
                    fromCurrencySelect.appendChild(optionFrom);

                    const optionTo = document.createElement('option');
                    optionTo.value = currency;
                    optionTo.textContent = `${currency} - ${data.currencies[currency]}`;
                    toCurrencySelect.appendChild(optionTo);
                });
            } else {
                resultDiv.innerHTML = 'Error: Failed to fetch currency list.';
            }
        })
        .catch(error => {
            resultDiv.innerHTML = 'Error: Unable to fetch currency list.';
            console.error('Error:', error);
        });

    // Handle form submission for currency conversion.
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const amount = amountInput.value;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (amount && fromCurrency && toCurrency) {
            fetch(`/api/convert?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&amount=${amount}`)
                .then(response => response.json())
                .then(data => {
                    if (data.convertedAmount) {
                        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${parseFloat(data.convertedAmount).toFixed(2)} ${toCurrency}`;
                    } else {
                        resultDiv.innerHTML = 'Error: Conversion failed.';
                    }
                })
                .catch(error => {
                    resultDiv.innerHTML = 'Error: Unable to fetch conversion rates.';
                    console.error('Error:', error);
                });
        } else {
            resultDiv.innerHTML = 'Please enter a valid amount and select both currencies.';
        }
    });
});
