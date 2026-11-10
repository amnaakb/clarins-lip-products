(function () {
  const STORAGE_KEY = "clarinsCart";
  let cart = loadCart();

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  // one place for price formatting (currency switcher will plug in here later)
  window.formatPrice = function (usd) {
    return "$" + usd.toFixed(2);
  };

  function findProduct(id) {
    return products.find(function (p) { return p.id === id; });
  }

  /* ---------- build the cart panel and navbar button ---------- */
  document.body.insertAdjacentHTML("beforeend",
    '<div class="offcanvas offcanvas-end" tabindex="-1" id="cart-panel" aria-labelledby="cart-title">' +
      '<div class="offcanvas-header">' +
        '<h2 class="offcanvas-title" id="cart-title">Your cart</h2>' +
        '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close cart"></button>' +
      '</div>' +
      '<div class="offcanvas-body">' +
        '<ul class="cart-list" id="cart-list"></ul>' +
        '<div class="cart-footer">' +
          '<p class="cart-total"><span>Total</span><strong id="cart-total">$0.00</strong></p>' +
          '<button type="button" class="btn-ink" id="cart-clear">Clear cart</button>' +
        '</div>' +
      '</div>' +
    '</div>');

  const navList = document.querySelector("#menu .navbar-nav");
  const navItem = document.createElement("li");
  navItem.innerHTML =
    '<button type="button" class="nav-link cart-btn" data-bs-toggle="offcanvas" ' +
    'data-bs-target="#cart-panel" aria-label="Open cart">Cart ' +
    '<span class="cart-count" id="cart-count">0</span></button>';
  navList.append(navItem);

  const list = document.getElementById("cart-list");
  const totalEl = document.getElementById("cart-total");
  const countEl = document.getElementById("cart-count");
  const clearBtn = document.getElementById("cart-clear");

  /* ---------- cart logic ---------- */
  function addToCart(id) {
    const line = cart.find(function (l) { return l.id === id; });
    if (line) {
      line.qty += 1;
    } else {
      cart.push({ id: id, qty: 1 });
    }
    saveCart();
    renderCart();
  }

  function changeQty(id, delta) {
    const line = cart.find(function (l) { return l.id === id; });
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      cart = cart.filter(function (l) { return l.id !== id; });
    }
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(function (l) { return l.id !== id; });
    saveCart();
    renderCart();
  }

  function makeButton(text, action, id, label) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.dataset.action = action;
    b.dataset.id = id;
    b.setAttribute("aria-label", label);
    return b;
  }

  /* ---------- show the cart ---------- */
  function renderCart() {
    list.replaceChildren();
    let total = 0;
    let count = 0;

    // forget products that no longer exist
    cart = cart.filter(function (l) { return findProduct(l.id); });

    if (cart.length === 0) {
      const empty = document.createElement("li");
      empty.className = "cart-empty";
      empty.textContent = "Your cart is empty. Add a shade to get started.";
      list.append(empty);
    }

    for (const line of cart) {
      const p = findProduct(line.id);
      const lineTotal = p.price * line.qty;
      total += lineTotal;
      count += line.qty;

      const li = document.createElement("li");
      li.className = "cart-item";

      const name = document.createElement("h3");
      name.textContent = p.name;

      const price = document.createElement("span");
      price.className = "cart-line-price";
      price.textContent = formatPrice(lineTotal);

      const qty = document.createElement("div");
      qty.className = "cart-qty";
      const qtyNumber = document.createElement("span");
      qtyNumber.textContent = line.qty;
      qty.append(
        makeButton("−", "minus", p.id, "Decrease quantity of " + p.name),
        qtyNumber,
        makeButton("+", "plus", p.id, "Increase quantity of " + p.name)
      );

      const remove = makeButton("Remove", "remove", p.id, "Remove " + p.name + " from cart");
      remove.className = "cart-remove";

      li.append(name, price, qty, remove);
      list.append(li);
    }

    totalEl.textContent = formatPrice(total);
    countEl.textContent = count;
    clearBtn.disabled = cart.length === 0;
  }

  /* ---------- events ---------- */
  // "Add to cart" buttons are created by products.js, so listen on the whole page
  document.addEventListener("click", function (e) {
    const addBtn = e.target.closest(".product-card button");
    if (!addBtn) return;
    addToCart(Number(addBtn.dataset.id));
    addBtn.textContent = "Added ✓";
    clearTimeout(addBtn.resetTimer);
    addBtn.resetTimer = setTimeout(function () {
      addBtn.textContent = "Add to cart";
    }, 1000);
  });

  list.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "plus") changeQty(id, 1);
    if (btn.dataset.action === "minus") changeQty(id, -1);
    if (btn.dataset.action === "remove") removeFromCart(id);
  });

  clearBtn.addEventListener("click", function () {
    cart = [];
    saveCart();
    renderCart();
  });

  renderCart();
})();