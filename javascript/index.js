let from = document.getElementById('from');
let to = document.getElementById('to');
let quantity = document.getElementById('quantity');
let result = document.getElementById('result');
let conversion_of_one_unit = document.getElementById('conversion_of_one_unit');
let currenciesList;
let selectCurrencies = [];
const dbPromise = idb.open('currenciesConverter', 1, upgradeDB => {
  upgradeDB.createObjectStore('currencies');
});
let db;
let store;

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
      currenciesList = currencies.results;
      for (let key in currencies.results) {
        selectCurrencies.push(currencies.results[key].currencyName);
      }
      return selectCurrencies;
    })

    .then(selectCurrencies => {
      selectCurrencies.forEach(currency => {
        createOption(currency, from);
        createOption(currency, to);
      });
    });
};

let conversionButton = document.getElementById('conversion');

// a function that return the code of a country from its name (which will be taken from the select)
// e.g "Tunisian Dinar" -> "TND"
let getCodeFromName = name => {
  for (let currencyCode in currenciesList) {
    if (currenciesList[currencyCode].currencyName === name) {
      return currenciesList[currencyCode].id;
    }
  }
};

//indexed DB object to store and read data

const IDB = {
  get(key) {
    return dbPromise.then(db => {
      return db
        .transaction('currencies')
        .objectStore('currencies')
        .get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx = db.transaction('currencies', 'readwrite');
      tx.objectStore('currencies').put(val, key);
      return tx.complete;
    });
  },
};

//converts an amount of source currency to a target currency
let conversion = (sourceName, targetName, number) => {
  let sourceCode = getCodeFromName(sourceName);
  let targetCode = getCodeFromName(targetName);

  let value;
  //get the conversion rate from the indexedDB

  fetch(
    `https://free.currencyconverterapi.com/api/v5/convert?q=${sourceCode}_${targetCode}`
  )
    .then(async response => {
      if (response) {
        let conversionObject = await response.json();
        value = conversionObject.results[`${sourceCode}_${targetCode}`].val;
      } else {
        IDB.get(`${sourceCode}_${targetCode}`).then(val => {
          console.log(val);
          value = val;
        });
      }
      return value;
    })

    .then(value => {
      IDB.set(`${sourceCode}_${targetCode}`, value);
      return value;
    })
    .then(value => {
      //store the conversion code and its value in the indexedDB
      result.innerText = value * number + ' ' + targetCode;
      conversion_of_one_unit.innerText = `1 ${sourceCode} = ${value} ${targetCode} `;
    })
    .catch(error => {
      console.log(
        'error while fetching the API for a conversion, I think youve gone offline'
      );
      throw error;
    });
};

conversionButton.onclick = () => {
  let number = quantity.value;
  let source = from.value;
  let target = to.value;
  conversion(source, target, number);
};
