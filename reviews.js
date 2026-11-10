(function () {
  const main = document.querySelector("main");
  const productList = document.getElementById("product-list");
  if (!main || !productList) return;

  const category = productList.dataset.category;
  const STORAGE_KEY = "clarinsReviews";

  // Labeled sample reviews so the section is never empty
  const sampleReviews = [
    { category: "perfector", name: "Sample", product: "Lip Perfector Berry", rating: 5, text: "Soft color and a comfortable, glossy finish.", sample: true },
    { category: "perfector", name: "Sample", product: "Lip Perfector Coral", rating: 4, text: "Easy to apply and good for everyday wear.", sample: true },
    { category: "perfector", name: "Sample", product: "Lip Perfector Rosewood", rating: 5, text: "A deep shade that still feels light on the lips.", sample: true },
    { category: "oil", name: "Sample", product: "Lip Oil Cherry", rating: 5, text: "Glossy and nourishing, with a nice cherry tint.", sample: true },
    { category: "oil", name: "Sample", product: "Lip Oil Honey", rating: 4, text: "Clear shine that works over any lipstick.", sample: true },
    { category: "oil", name: "Sample", product: "Lip Oil Mahogany", rating: 4, text: "Rich color and the wand makes it easy to apply.", sample: true }
  ];

  function loadUserReviews() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  }

  function saveUserReviews() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userReviews));
    } catch (e) {}
  }

  let userReviews = loadUserReviews();

  /* ---------- build the section ---------- */
  const section = document.createElement("section");
  section.className = "reviews";

  let options = '<option value="">Choose a product</option>';
  for (const p of products) {
    if (p.category === category) {
      options += '<option value="' + p.name + '">' + p.name + "</option>";
    }
  }

  section.innerHTML =
    '<h2>Customer reviews</h2>' +
    '<p class="review-summary" id="review-summary"></p>' +
    '<div class="review-layout">' +
      '<div class="review-list" id="review-list"></div>' +
      '<form class="review-form" id="review-form" novalidate>' +
        '<h3>Write a review</h3>' +
        '<div class="mb-3"><label class="form-label" for="rv-name">Your name</label>' +
          '<input class="form-control" id="rv-name" type="text" autocomplete="name">' +
          '<div class="field-error" id="rv-name-error" aria-live="polite"></div></div>' +
        '<div class="mb-3"><label class="form-label" for="rv-email">Email</label>' +
          '<input class="form-control" id="rv-email" type="email" autocomplete="email">' +
          '<div class="field-error" id="rv-email-error" aria-live="polite"></div></div>' +
        '<div class="mb-3"><label class="form-label" for="rv-product">Product</label>' +
          '<select class="form-select" id="rv-product">' + options + '</select>' +
          '<div class="field-error" id="rv-product-error" aria-live="polite"></div></div>' +
        '<div class="mb-3"><label class="form-label" for="rv-rating">Rating</label>' +
          '<select class="form-select" id="rv-rating">' +
            '<option value="">Choose a rating</option>' +
            '<option value="5">5 - Excellent</option><option value="4">4 - Good</option>' +
            '<option value="3">3 - Okay</option><option value="2">2 - Poor</option>' +
            '<option value="1">1 - Bad</option></select>' +
          '<div class="field-error" id="rv-rating-error" aria-live="polite"></div></div>' +
        '<div class="mb-3"><label class="form-label" for="rv-text">Your review</label>' +
          '<textarea class="form-control" id="rv-text" rows="3"></textarea>' +
          '<div class="field-error" id="rv-text-error" aria-live="polite"></div></div>' +
        '<button type="submit" class="btn-ink">Submit review</button>' +
        '<p class="review-success" id="review-success" role="status"></p>' +
      '</form>' +
    '</div>';
  main.append(section);

  const form = document.getElementById("review-form");
  const list = document.getElementById("review-list");
  const summary = document.getElementById("review-summary");
  const success = document.getElementById("review-success");

  /* ---------- validation ---------- */
  const rules = {
    name: function (v) {
      v = v.trim();
      if (!v) return "Please enter your name.";
      if (!/^[A-Za-z\u00C0-\u024F\u0400-\u04FF' -]{2,}$/.test(v)) return "Use letters only, at least 2 characters.";
      return "";
    },
    email: function (v) {
      v = v.trim();
      if (!v) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email, like name@example.com.";
      return "";
    },
    product: function (v) {
      return v ? "" : "Please choose a product.";
    },
    rating: function (v) {
      return v ? "" : "Please choose a rating.";
    },
    text: function (v) {
      v = v.trim();
      if (!v) return "Please write your review.";
      if (v.length < 10) return "Write at least 10 characters.";
      if (v.length > 300) return "Keep it under 300 characters.";
      return "";
    }
  };

  function showError(key, message) {
    const field = document.getElementById("rv-" + key);
    document.getElementById("rv-" + key + "-error").textContent = message;
    field.classList.toggle("is-invalid", message !== "");
    field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  }

  function validateField(key) {
    const message = rules[key](document.getElementById("rv-" + key).value);
    showError(key, message);
    return message === "";
  }

  // errors disappear as soon as the field is corrected
  for (const key of Object.keys(rules)) {
    const field = document.getElementById("rv-" + key);
    field.addEventListener("input", function () { success.textContent = ""; validateField(key); });
    field.addEventListener("change", function () { validateField(key); });
  }

  /* ---------- show the reviews ---------- */
  function renderReviews() {
    const all = sampleReviews.concat(userReviews).filter(function (r) {
      return r.category === category;
    });

    list.replaceChildren();
    let sum = 0;

    for (const r of all) {
      sum += r.rating;

      const card = document.createElement("article");
      card.className = "review-card";

      const stars = document.createElement("p");
      stars.className = "review-stars";
      stars.textContent = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
      stars.setAttribute("aria-label", r.rating + " out of 5 stars");

      const product = document.createElement("h3");
      product.textContent = r.product;

      const text = document.createElement("p");
      text.textContent = r.text;

      const by = document.createElement("p");
      by.className = "review-by";
      by.textContent = r.sample ? "Sample review for this concept project" : "By " + r.name;

      card.append(stars, product, text, by);
      list.append(card);
    }

    summary.textContent = all.length === 0
      ? "No reviews yet. Be the first to write one."
      : "Average rating " + (sum / all.length).toFixed(1) + " / 5 from " + all.length + " reviews";
  }

  /* ---------- submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;
    for (const key of Object.keys(rules)) {
      if (!validateField(key)) valid = false;
    }
    if (!valid) {
      success.textContent = "";
      return;
    }

    userReviews.push({
      category: category,
      name: document.getElementById("rv-name").value.trim(),
      product: document.getElementById("rv-product").value,
      rating: Number(document.getElementById("rv-rating").value),
      text: document.getElementById("rv-text").value.trim()
    });
    saveUserReviews();
    renderReviews();

    form.reset();
    for (const key of Object.keys(rules)) showError(key, "");
    success.textContent = "Thank you! Your review was added.";
  });

  renderReviews();
})();