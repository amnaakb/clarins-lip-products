// Front-end demonstration only: fixed sample rates and delivery estimates from data.js.
(function () {
  const COUNTRY_KEY = 'clarinsShippingCountry';
  const CURRENCY_KEY = 'clarinsCurrency';
  const validCurrencies = Object.keys(rates);
  function read(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  window.getCountry = function () {
    return countries.find(c => c.code === read(COUNTRY_KEY)) || null;
  };
  window.getCurrency = function () {
    const saved = read(CURRENCY_KEY);
    return validCurrencies.includes(saved) ? saved : 'USD';
  };
  window.formatPrice = function (usd) {
    const currency = getCurrency();
    const number = Number(usd) * rates[currency];
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency,
      maximumFractionDigits: currency === 'KZT' ? 0 : 2
    }).format(number);
  };
  function notify() { document.dispatchEvent(new Event('settingschange')); }
  window.setCountry = function (code) {
    const country = countries.find(c => c.code === code);
    if (!country) return false;
    write(COUNTRY_KEY, country.code);
    // Choosing a country also selects its default currency; the currency menu can override it.
    write(CURRENCY_KEY, country.currency);
    notify();
    return true;
  };
  window.setCurrency = function (currency) {
    if (!validCurrencies.includes(currency)) return false;
    write(CURRENCY_KEY, currency);
    notify();
    return true;
  };
})();
