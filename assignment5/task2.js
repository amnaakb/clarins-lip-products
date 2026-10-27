const MAX_BUILDS = 3;
const DEFAULT_BUDGET = 80;

const categories = ["Lip Perfector", "Lip Oil", "Lip Liner", "Pouch"];

const products = [
  { id: 1, name: "Lip Perfector Rosewood", category: "Lip Perfector", price: 27, inStock: true, finish: "glossy" },
  { id: 2, name: "Lip Perfector Coral Matte", category: "Lip Perfector", price: 27, inStock: true, finish: "matte" },
  { id: 3, name: "Lip Perfector Nude", category: "Lip Perfector", price: 29, inStock: false, finish: "glossy" },
  { id: 4, name: "Lip Comfort Oil Honey", category: "Lip Oil", price: 26, inStock: true, finish: "glossy" },
  { id: 5, name: "Lip Comfort Oil Mint", category: "Lip Oil", price: 26, inStock: true, finish: "glossy" },
  { id: 6, name: "Lip Comfort Oil Raspberry", category: "Lip Oil", price: 28, inStock: false, finish: "glossy" },
  { id: 7, name: "Lip Liner Brown", category: "Lip Liner", price: 18, inStock: true, finish: "matte" },
  { id: 8, name: "Lip Liner Red", category: "Lip Liner", price: 18, inStock: true, finish: "matte" },
  { id: 9, name: "Lip Liner Clear", category: "Lip Liner", price: 15, inStock: true, finish: "glossy" },
  { id: 10, name: "Travel Pouch", category: "Pouch", price: 12, inStock: true, finish: "none" },
  { id: 11, name: "Silk Gift Pouch", category: "Pouch", price: 20, inStock: true, finish: "none" },
  { id: 12, name: "Leather Pouch", category: "Pouch", price: 35, inStock: true, finish: "none" }
];

const productsBox = document.getElementById("products");
const selectionBox = document.getElementById("selection");
const buildsBox = document.getElementById("builds");
const compareBox = document.getElementById("compare");
const messageEl = document.getElementById("message");
const totalEl = document.getElementById("total");
const leftEl = document.getElementById("left");
const bar = document.getElementById("budgetBar");
const budgetInput = document.getElementById("budget");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");

let budget = DEFAULT_BUDGET;
let selection = {};
let builds = [];
let buildCounter = 0;
let search = "";
let filterCategory = "all";
let message = { text: "", type: "" };

function make(tag, text, className) {
  const el = document.createElement(tag);
  if (text) {
    el.textContent = text;
  }
  if (className) {
    el.className = className;
  }
  return el;
}

function setMessage(text, type) {
  message = { text: text, type: type };
}

function selectedItems() {
  const items = [];
  for (const category of categories) {
    if (selection[category]) {
      items.push(selection[category]);
    }
  }
  return items;
}

function getTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  return total;
}

function getBlockReason(product) {
  if (!product.inStock) {
    return product.name + " is out of stock.";
  }

  const others = selectedItems().filter(function (item) {
    return item.category !== product.category;
  });

  for (const other of others) {
    const mixed =
      (product.finish === "matte" && other.finish === "glossy") ||
      (product.finish === "glossy" && other.finish === "matte");
    if (mixed) {
      return "Matte and glossy do not mix: " + other.name + " is " + other.finish + ".";
    }
  }

  const newTotal = getTotal(others) + product.price;
  if (newTotal > budget) {
    return "Over the budget by " + (newTotal - budget) + " €.";
  }
  return "";
}

function renderProducts() {
  const list = products.filter(function (p) {
    const okCategory = filterCategory === "all" || p.category === filterCategory;
    const okName = p.name.toLowerCase().includes(search);
    return okCategory && okName;
  });

  productsBox.replaceChildren();

  if (list.length === 0) {
    productsBox.append(make("p", "Nothing found. Try another name or category.", "empty"));
    return;
  }

  for (const p of list) {
    const chosen = selection[p.category];
    const isSelected = chosen !== undefined && chosen.id === p.id;
    const reason = isSelected ? "" : getBlockReason(p);

    const card = make("article", "", "product");
    card.classList.toggle("selected", isSelected);
    card.classList.toggle("blocked", reason !== "");

    const details = (p.finish === "none" ? "" : p.finish + " · ") + p.price + " €";
    card.append(make("p", p.category, "label"), make("h3", p.name), make("p", details, "muted"));

    if (reason !== "") {
      card.append(make("p", reason, "reason"));
    }

    const button = make("button", isSelected ? "Remove" : "Add", isSelected ? "btn btn-secondary" : "btn");
    button.type = "button";
    button.dataset.id = p.id;
    card.append(button);

    productsBox.append(card);
  }
}

function renderSelection() {
  const items = selectedItems();
  const total = getTotal(items);

  selectionBox.replaceChildren();
  if (items.length === 0) {
    selectionBox.append(make("p", "Nothing selected yet.", "empty"));
  }
  for (const item of items) {
    selectionBox.append(make("p", item.category + ": " + item.name + " (" + item.price + " €)"));
  }

  totalEl.textContent = total + " €";
  leftEl.textContent = budget - total + " €";
  bar.max = budget;
  bar.value = total;
}

function renderBuilds() {
  buildsBox.replaceChildren();
  compareBox.replaceChildren();

  if (builds.length === 0) {
    buildsBox.append(make("p", "No saved builds yet. You can save up to " + MAX_BUILDS + " and compare them.", "empty"));
    return;
  }

  for (const b of builds) {
    const row = make("div", "", "build");
    row.append(make("span", b.name + ": " + b.total + " €"));
    const del = make("button", "Delete", "btn btn-secondary");
    del.type = "button";
    del.dataset.build = b.id;
    row.append(del);
    buildsBox.append(row);
  }

  const table = document.createElement("table");
  const head = table.insertRow();
  head.append(make("th", "Category"));
  for (const b of builds) {
    head.append(make("th", b.name));
  }

  for (const category of categories) {
    const row = table.insertRow();
    row.append(make("th", category));
    for (const b of builds) {
      const found = b.items.find(function (item) {
        return item.category === category;
      });
      row.append(make("td", found ? found.name : "-"));
    }
  }

  const totalRow = table.insertRow();
  totalRow.append(make("th", "Total"));
  const totals = builds.map(function (b) {
    return b.total;
  });
  const cheapest = Math.min(...totals);
  for (const b of builds) {
    const cell = make("td", b.total + " €");
    if (builds.length > 1 && b.total === cheapest) {
      cell.className = "cheapest";
    }
    totalRow.append(cell);
  }

  compareBox.append(table);
}

function render() {
  renderProducts();
  renderSelection();
  renderBuilds();
  messageEl.textContent = message.text;
  messageEl.className = "message " + message.type;
}

productsBox.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  const product = products.find(function (p) {
    return p.id === Number(button.dataset.id);
  });
  if (!product) {
    return;
  }

  const chosen = selection[product.category];
  if (chosen !== undefined && chosen.id === product.id) {
    delete selection[product.category];
    setMessage(product.name + " removed.", "ok");
  } else {
    const reason = getBlockReason(product);
    if (reason !== "") {
      setMessage("Cannot add " + product.name + ". " + reason, "error");
    } else {
      selection[product.category] = product;
      setMessage(product.name + " added.", "ok");
    }
  }
  render();
});

buildsBox.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  const id = Number(button.dataset.build);
  builds = builds.filter(function (b) {
    return b.id !== id;
  });
  setMessage("Build deleted.", "ok");
  render();
});

saveBtn.addEventListener("click", function () {
  const items = selectedItems();
  if (items.length === 0) {
    setMessage("Pick at least one item before saving.", "error");
  } else if (builds.length >= MAX_BUILDS) {
    setMessage("You can keep only " + MAX_BUILDS + " builds. Delete one first.", "error");
  } else {
    buildCounter++;
    builds.push({
      id: buildCounter,
      name: "Build " + buildCounter,
      items: items,
      total: getTotal(items)
    });
    setMessage("Build " + buildCounter + " saved.", "ok");
  }
  render();
});

clearBtn.addEventListener("click", function () {
  selection = {};
  setMessage("Selection cleared.", "ok");
  render();
});

budgetInput.addEventListener("change", function () {
  const value = Number(budgetInput.value);
  const total = getTotal(selectedItems());

  if (budgetInput.value === "" || Number.isNaN(value) || value <= 0) {
    setMessage("Budget must be a number greater than 0.", "error");
    budgetInput.value = budget;
  } else if (value < total) {
    setMessage("Your set already costs " + total + " €. Remove something first or set a higher budget.", "error");
    budgetInput.value = budget;
  } else {
    budget = value;
    setMessage("Budget set to " + budget + " €.", "ok");
  }
  render();
});

searchInput.addEventListener("input", function () {
  search = searchInput.value.trim().toLowerCase();
  render();
});

categorySelect.addEventListener("change", function () {
  filterCategory = categorySelect.value;
  render();
});

for (const category of categories) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categorySelect.append(option);
}

render();