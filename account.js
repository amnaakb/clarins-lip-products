(function () {
  const USERS_KEY = "clarinsUsers";
  const CURRENT_KEY = "clarinsCurrentUser";
  const SEEN_KEY = "clarinsWelcomeSeen";

  /* ---------- storage helpers ---------- */
  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  let users = read(USERS_KEY, []);
  if (!Array.isArray(users)) users = [];

  function findUser(email) {
    email = email.trim().toLowerCase();
    return users.find(function (u) { return u.email === email; });
  }

  function currentUser() {
    const email = read(CURRENT_KEY, "");
    return email ? findUser(email) : undefined;
  }

  // front-end demo only: passwords are hashed, but a real site needs a server
  async function hashPassword(text) {
    if (window.crypto && crypto.subtle) {
      const data = new TextEncoder().encode(text);
      const buffer = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buffer)).map(function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    }
    return btoa(text);
  }

  /* ---------- option lists ---------- */
  let countryOptions = '<option value="">Choose a country</option>';
  for (const c of countries) {
    countryOptions += '<option value="' + c.code + '">' + c.name + "</option>";
  }

  let currencyOptions = "";
  for (const code of Object.keys(rates)) {
    currencyOptions += '<option value="' + code + '">' + code + " (" + symbols[code] + ")</option>";
  }

  /* ---------- html builders ---------- */
  function inputHtml(prefix, key, label, type, autocomplete) {
    return '<div class="mb-3">' +
      '<label class="form-label" for="' + prefix + "-" + key + '">' + label + "</label>" +
      '<input class="form-control" id="' + prefix + "-" + key + '" type="' + type + '" autocomplete="' + autocomplete + '">' +
      '<div class="field-error" id="' + prefix + "-" + key + '-error" aria-live="polite"></div></div>';
  }

  function selectHtml(prefix, key, label, options) {
    return '<div class="mb-3">' +
      '<label class="form-label" for="' + prefix + "-" + key + '">' + label + "</label>" +
      '<select class="form-select" id="' + prefix + "-" + key + '">' + options + "</select>" +
      '<div class="field-error" id="' + prefix + "-" + key + '-error" aria-live="polite"></div></div>';
  }

  document.body.insertAdjacentHTML("beforeend",
    '<div class="modal fade" id="account-modal" tabindex="-1" aria-labelledby="account-title" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered"><div class="modal-content account-content">' +
        '<div class="modal-header"><h2 class="modal-title" id="account-title">Welcome</h2>' +
          '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>' +
        '<div class="modal-body">' +
          '<div class="account-tabs" id="account-tabs">' +
            '<button type="button" class="account-tab" data-pane="signup">Sign up</button>' +
            '<button type="button" class="account-tab" data-pane="signin">Sign in</button>' +
          "</div>" +

          '<section id="pane-signup"><form id="signup-form" novalidate>' +
            inputHtml("su", "name", "Full name", "text", "name") +
            inputHtml("su", "email", "Email", "email", "email") +
            inputHtml("su", "phone", "Phone", "tel", "tel") +
            inputHtml("su", "password", "Password", "password", "new-password") +
            inputHtml("su", "confirm", "Confirm password", "password", "new-password") +
            selectHtml("su", "country", "Shipping country", countryOptions) +
            '<button type="submit" class="btn-ink">Create account</button>' +
            '<p class="account-success" id="su-success" role="status"></p>' +
            '<button type="button" class="account-link" data-guest>Continue as guest</button>' +
          "</form></section>" +

          '<section id="pane-signin" hidden><form id="signin-form" novalidate>' +
            inputHtml("si", "email", "Email", "email", "email") +
            inputHtml("si", "password", "Password", "password", "current-password") +
            '<button type="submit" class="btn-ink">Sign in</button>' +
            '<p class="account-success" id="si-success" role="status"></p>' +
            '<button type="button" class="account-link" data-guest>Continue as guest</button>' +
          "</form></section>" +

          '<section id="pane-country" hidden><form id="country-form" novalidate>' +
            selectHtml("ct", "country", "Shipping country", countryOptions) +
            '<p class="account-note" id="ct-preview"></p>' +
            '<button type="submit" class="btn-ink">Continue</button>' +
            '<p class="account-success" id="ct-success" role="status"></p>' +
          "</form></section>" +

          '<section id="pane-profile" hidden>' +
            '<p class="account-note" id="pf-name"></p>' +
            '<p class="account-note" id="pf-email"></p>' +
            '<p class="account-note" id="pf-country"></p>' +
            '<button type="button" class="btn-ink" id="logout-btn">Log out</button>' +
          "</section>" +
        "</div>" +
      "</div></div></div>");

  const modalEl = document.getElementById("account-modal");
  const tabs = document.getElementById("account-tabs");
  const titleEl = document.getElementById("account-title");
  const titles = {
    signup: "Create your account",
    signin: "Welcome back",
    country: "Where should we ship?",
    profile: "Your account"
  };

  /* ---------- validation helpers ---------- */
  function setError(prefix, key, message) {
    const field = document.getElementById(prefix + "-" + key);
    document.getElementById(prefix + "-" + key + "-error").textContent = message;
    field.classList.toggle("is-invalid", message !== "");
    field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  }

  function wire(prefix, rules) {
    const checks = {};
    for (const key of Object.keys(rules)) {
      const field = document.getElementById(prefix + "-" + key);
      checks[key] = function () {
        const message = rules[key](field.value);
        setError(prefix, key, message);
        return message === "";
      };
      // errors appear while typing and disappear when corrected
      field.addEventListener("input", checks[key]);
      field.addEventListener("change", checks[key]);
    }
    return {
      checks: checks,
      validateAll: function () {
        let firstBad = null;
        for (const key of Object.keys(checks)) {
          if (!checks[key]() && firstBad === null) firstBad = key;
        }
        if (firstBad !== null) {
          document.getElementById(prefix + "-" + firstBad).focus();
        }
        return firstBad === null;
      },
      clear: function () {
        for (const key of Object.keys(checks)) setError(prefix, key, "");
      }
    };
  }

  const signup = wire("su", {
    name: function (v) {
      v = v.trim();
      if (!v) return "Please enter your full name.";
      if (!/^[A-Za-z\u00C0-\u024F\u0400-\u04FF' -]{2,}$/.test(v)) return "Use letters only, at least 2 characters.";
      return "";
    },
    email: function (v) {
      v = v.trim();
      if (!v) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email, like name@example.com.";
      if (findUser(v)) return "This email is already registered. Try signing in.";
      return "";
    },
    phone: function (v) {
      v = v.trim();
      const digits = v.replace(/\D/g, "");
      if (!v) return "Please enter your phone number.";
      if (!/^\+?[0-9\s()-]+$/.test(v) || digits.length < 10 || digits.length > 15) {
        return "Enter a valid phone number, like +7 700 123 4567.";
      }
      return "";
    },
    password: function (v) {
      if (!v) return "Please create a password.";
      if (v.length < 8) return "Use at least 8 characters.";
      if (!/[A-Z]/.test(v)) return "Add at least one capital letter.";
      if (!/[0-9]/.test(v)) return "Add at least one number.";
      return "";
    },
    confirm: function (v) {
      if (!v) return "Please repeat your password.";
      if (v !== document.getElementById("su-password").value) return "Passwords do not match.";
      return "";
    },
    country: function (v) {
      return v ? "" : "Please choose your shipping country.";
    }
  });

  // changing the password re-checks the confirmation
  document.getElementById("su-password").addEventListener("input", function () {
    if (document.getElementById("su-confirm").value) signup.checks.confirm();
  });

  const signin = wire("si", {
    email: function (v) {
      v = v.trim();
      if (!v) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email, like name@example.com.";
      return "";
    },
    password: function (v) {
      return v ? "" : "Please enter your password.";
    }
  });

  const country = wire("ct", {
    country: function (v) {
      return v ? "" : "Please choose a country.";
    }
  });

  /* ---------- panes ---------- */
  const ctSelect = document.getElementById("ct-country");
  const ctPreview = document.getElementById("ct-preview");

  function updatePreview() {
    const c = countries.find(function (x) { return x.code === ctSelect.value; });
    ctPreview.textContent = c
      ? "Shipping to " + c.name + ": " + formatPrice(c.shipping) + ", about " + c.days + " days."
      : "";
  }
  ctSelect.addEventListener("change", updatePreview);

  function showPane(name) {
    for (const key of Object.keys(titles)) {
      document.getElementById("pane-" + key).hidden = key !== name;
    }
    titleEl.textContent = titles[name];
    tabs.hidden = !(name === "signup" || name === "signin");
    for (const tab of tabs.querySelectorAll(".account-tab")) {
      tab.setAttribute("aria-selected", tab.dataset.pane === name ? "true" : "false");
    }
    for (const id of ["su-success", "si-success", "ct-success"]) {
      document.getElementById(id).textContent = "";
    }

    if (name === "country") {
      const current = getCountry();
      ctSelect.value = current ? current.code : "";
      country.clear();
      updatePreview();
    }
    if (name === "profile") {
      const user = currentUser();
      const c = getCountry();
      document.getElementById("pf-name").textContent = "Name: " + (user ? user.name : "");
      document.getElementById("pf-email").textContent = "Email: " + (user ? user.email : "");
      document.getElementById("pf-country").textContent = "Shipping to: " + (c ? c.name : "not chosen yet");
    }
  }

  function openAccount(pane) {
    if (!window.bootstrap) return;
    showPane(pane);
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  function closeAccount() {
    if (!window.bootstrap) return;
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
  }

  for (const tab of tabs.querySelectorAll(".account-tab")) {
    tab.addEventListener("click", function () { showPane(tab.dataset.pane); });
  }
  for (const guest of modalEl.querySelectorAll("[data-guest]")) {
    guest.addEventListener("click", function () { showPane("country"); });
  }

  /* ---------- navbar button ---------- */
  const navList = document.querySelector("#menu .navbar-nav");
  let accountBtn = null;
  if (navList) {
    const item = document.createElement("li");
    item.innerHTML = '<button type="button" class="nav-link cart-btn" id="account-btn">Sign in</button>';
    navList.append(item);
    accountBtn = document.getElementById("account-btn");
    accountBtn.addEventListener("click", function () {
      openAccount(currentUser() ? "profile" : "signin");
    });
  }

  function updateAccountUi() {
    if (!accountBtn) return;
    const user = currentUser();
    accountBtn.textContent = user ? "Hi, " + user.name.trim().split(/\s+/)[0] : "Sign in";
  }

  /* ---------- forms ---------- */
  document.getElementById("signup-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!signup.validateAll()) return;

    const user = {
      name: document.getElementById("su-name").value.trim(),
      email: document.getElementById("su-email").value.trim().toLowerCase(),
      phone: document.getElementById("su-phone").value.trim(),
      password: await hashPassword(document.getElementById("su-password").value),
      country: document.getElementById("su-country").value
    };
    users.push(user);
    write(USERS_KEY, users);
    write(CURRENT_KEY, user.email);

    setCountry(user.country);
    updateAccountUi();
    document.getElementById("signup-form").reset();
    signup.clear();
    document.getElementById("su-success").textContent = "Account created. Welcome, " + user.name.split(/\s+/)[0] + "!";
    setTimeout(closeAccount, 1200);
  });

  document.getElementById("signin-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!signin.validateAll()) return;

    const user = findUser(document.getElementById("si-email").value);
    const hash = await hashPassword(document.getElementById("si-password").value);
    if (!user || user.password !== hash) {
      setError("si", "password", "Wrong email or password.");
      return;
    }

    write(CURRENT_KEY, user.email);
    if (!getCountry() && user.country) setCountry(user.country);
    updateAccountUi();
    document.getElementById("signin-form").reset();
    signin.clear();

    if (getCountry()) {
      document.getElementById("si-success").textContent = "Signed in. Welcome back, " + user.name.split(/\s+/)[0] + "!";
      setTimeout(closeAccount, 1000);
    } else {
      showPane("country");
    }
  });

  document.getElementById("country-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!country.validateAll()) return;
    setCountry(ctSelect.value);
    document.getElementById("ct-success").textContent = "Saved. We will ship to " + getCountry().name + ".";
    setTimeout(closeAccount, 900);
  });

  document.getElementById("logout-btn").addEventListener("click", function () {
    write(CURRENT_KEY, "");
    updateAccountUi();
    closeAccount();
  });

  /* ---------- footer: country and currency ---------- */
  const footer = document.querySelector("footer");
  let ftCountry = null;
  let ftCurrency = null;

  if (footer) {
    footer.insertAdjacentHTML("afterbegin",
      '<div class="settings-bar">' +
        '<label for="ft-country">Ship to</label>' +
        '<select class="form-select" id="ft-country">' + countryOptions + "</select>" +
        '<label for="ft-currency">Currency</label>' +
        '<select class="form-select" id="ft-currency">' + currencyOptions + "</select>" +
      "</div>");
    ftCountry = document.getElementById("ft-country");
    ftCurrency = document.getElementById("ft-currency");

    ftCountry.addEventListener("change", function () {
      if (ftCountry.value) {
        setCountry(ftCountry.value);
      } else {
        syncFooter();
      }
    });
    ftCurrency.addEventListener("change", function () {
      setCurrency(ftCurrency.value);
    });
  }

  function syncFooter() {
    if (!ftCountry) return;
    const c = getCountry();
    ftCountry.value = c ? c.code : "";
    ftCurrency.value = getCurrency();
  }

  document.addEventListener("settingschange", function () {
    syncFooter();
    updatePreview();
  });

  /* ---------- start ---------- */
  updateAccountUi();
  syncFooter();

  // first visit: show sign up / sign in, then the country
  if (!read(SEEN_KEY, false)) {
    write(SEEN_KEY, true);
    if (!currentUser()) {
      openAccount("signup");
    } else if (!getCountry()) {
      openAccount("country");
    }
  }
})();