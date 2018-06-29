let from = document.getElementById('from');
let to = document.getElementById('to');
let quantity = document.getElementById('quantity');
let result = document.getElementById('result');
let conversion_of_one_unit = document.getElementById('conversion_of_one_unit');
let currenciesList;
//create an option containing a currency and append it in a select
let createOption = (currency, target) => {
  let option = document.createElement('option');
  option.innerText = currency;
  target.appendChild(option);
};
//get all currencies and fill the two select elements as options
window.onload = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => console.log('registered'));
  }
  fetch('https://free.currencyconverterapi.com/api/v5/currencies')
    .then(response => response.json())
    .then(currencies => {
      currenciesList = currencies;
      for (let key in currencies.results) {
        createOption(currencies.results[key].currencyName, from);
        createOption(currencies.results[key].currencyName, to);
      }
    });
};
let conversionButton = document.getElementById('conversion');

// a function that return the code of a country from its name (which will be taken from the select)
// e.g "Tunisian Dinar" -> "TND"
let getCodeFromName = name => {
  for (let currencyCode in currenciesList.results) {
    if (currenciesList.results[currencyCode].currencyName === name) {
      return currenciesList.results[currencyCode].id;
    }
  }
};
//converts an amount of source currency to a target currency
let conversion = (sourceName, targetName, number) => {
  let sourceCode = getCodeFromName(sourceName);
  let targetCode = getCodeFromName(targetName);
  fetch(
    `https://free.currencyconverterapi.com/api/v5/convert?q=${sourceCode}_${targetCode}`
  )
    .then(response => response.json())
    .then(conversionObject => {
      let value = conversionObject.results[`${sourceCode}_${targetCode}`].val;
      result.innerText = value * number + targetCode;
      conversion_of_one_unit.innerText = value + 'per unit';
    })
    .catch(error => console.log('error' + error));
};

conversionButton.onclick = () => {
  let number = quantity.value;
  let source = from.value;
  let target = to.value;
  conversion(source, target, number);
};
