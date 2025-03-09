document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const resultDiv = document.getElementById('result');
    const form = document.getElementById('converter-form');
    const apiUrl = "https//currency-converter-api-gamma-vercel.app/api/convert?list=true"
  
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        if (data) {
            for (currency in data) {
                const optionFrom = document.createElement('option');
                optionFrom.value = `${currency}: ${data[currency]}`;
                optionFrom.textContent = currency;
                fromCurrencySelect.appendChild(optionFrom);

                const optionTo = document.createElement('option');
                optionTo.value = `${currency}: ${data[currency]}`;
                optionTo.textContent = `${currency}: ${data[currency]}`;
                toCurrencySelect.appendChild(optionTo);
            }
        } else {
            resultDiv.innerHTML = 'Error: Failed to fetch currency list.';
        }
    })
    .catch(error => {
        resultDiv.innerHTML = 'Error: Unable to fetch currency list.';
        console.error('Error:', error);
    });
  
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
  