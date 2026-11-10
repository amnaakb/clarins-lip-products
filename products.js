(function () {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  const category = productList.dataset.category;
  const items = products.filter(function (p) {
    return p.category === category;
  });

  function renderProducts() {
    productList.replaceChildren();

    if (items.length === 0) {
      const msg = document.createElement("p");
      msg.textContent = "Nothing found. Try another shade.";
      productList.append(msg);
      return;
    }

    for (const item of items) {
      const card = document.createElement("article");
      card.className = "product-card";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;

      const title = document.createElement("h3");
      title.textContent = item.name;

      const desc = document.createElement("p");
      desc.textContent = item.description;

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = formatPrice(item.price);

      const btn = document.createElement("button");
      btn.textContent = "Add to cart";
      btn.dataset.id = item.id;

      card.append(img, title, desc, price, btn);
      productList.append(card);
    }
  }

  renderProducts();

  // redraw the prices when the currency changes
  document.addEventListener("settingschange", renderProducts);
})();