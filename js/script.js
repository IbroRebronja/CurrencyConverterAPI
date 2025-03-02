document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const resultDiv = document.getElementById('result');
    const form = document.getElementById('converter-form');

    // Fetch the list of available currencies dynamically from the API
    fetch('https://v6.exchangerate-api.com/v6/YOUR_API_KEY/codes') // Replace YOUR_API_KEY with the actual API key
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                const currencies = Object.keys(data.supported_codes); // List of supported currencies
                // Populate the currency select options dynamically
                currencies.forEach(currency => {
                    const optionFrom = document.createElement('option');
                    optionFrom.value = currency;
                    optionFrom.textContent = currency;
                    fromCurrencySelect.appendChild(optionFrom);

                    const optionTo = document.createElement('option');
                    optionTo.value = currency;
                    optionTo.textContent = currency;
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

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();  // Prevent the form from submitting normally

        const amount = amountInput.value;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        // Check if all inputs are filled
        if (amount && fromCurrency && toCurrency) {
            // Send a request to the Vercel API route
            fetch(`/api/convert?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&amount=${amount}`)
                .then(response => response.json())
                .then(data => {
                    if (data.convertedAmount) {
                        // Display the converted amount
                        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${(parseFloat(data.convertedAmount)).toFixed(2)} ${toCurrency}`;
                    } else {
                        resultDiv.innerHTML = 'Error: Conversion failed.';
                    }
                })
                .catch(error => {
                    resultDiv.innerHTML = 'Error: Unable to fetch conversion rates.';
                    console.error('Error:', error);
                });
        } else {
            // Display a message if any fields are empty
            resultDiv.innerHTML = 'Please enter a valid amount and select both currencies.';
        }
    });
});
