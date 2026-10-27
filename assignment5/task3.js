const events = [
  { id: "masterclass", name: "Lip Perfector Masterclass", soldOut: ["2026-11-14", "2026-11-21"] },
  { id: "launch", name: "Lip Oil Launch Party", soldOut: ["2026-12-05"] },
  { id: "consult", name: "Beauty Consultation Day", soldOut: [] }
];

const ticketTypes = [
  { id: "standard", name: "Standard", price: 15, seatsLeft: 20 },
  { id: "vip", name: "VIP", price: 40, seatsLeft: 5 },
  { id: "student", name: "Student", price: 10, seatsLeft: 3 }
];

const promoCodes = [
  { code: "LIPS10", percent: 10 },
  { code: "CLARINS20", percent: 20 },
  { code: "STUDENT5", percent: 5 }
];

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

const form = document.getElementById("ticketForm");
form.noValidate = true;

const fields = Array.from(form.elements).filter(function (el) {
  return el.name;
});
const touched = new Set();

const summary = document.getElementById("formErrors");
const result = document.getElementById("result");
const preview = {
  event: document.getElementById("pEvent"),
  date: document.getElementById("pDate"),
  type: document.getElementById("pType"),
  qty: document.getElementById("pQty"),
  name: document.getElementById("pName"),
  email: document.getElementById("pEmail"),
  promo: document.getElementById("pPromo"),
  total: document.getElementById("pTotal")
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function bookingCode() {
  let code = "CL-";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[randomInt(0, CODE_CHARS.length - 1)];
  }
  return code;
}

function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

function findEvent(id) {
  return events.find(function (e) {
    return e.id === id;
  });
}

function findType(id) {
  return ticketTypes.find(function (t) {
    return t.id === id;
  });
}

function findPromo(text) {
  const code = text.trim().toUpperCase();
  return promoCodes.find(function (p) {
    return p.code === code;
  });
}

function calcTotal(type, qty, promo) {
  if (!type || !(qty > 0)) {
    return 0;
  }
  let total = type.price * qty;
  if (promo) {
    total = total - (total * promo.percent) / 100;
  }
  return Math.round(total * 100) / 100;
}

function makeOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function fillEvents() {
  for (const e of events) {
    form.elements.eventId.append(makeOption(e.id, e.name));
  }
}

function fillTypes() {
  const select = form.elements.ticketType;
  select.replaceChildren(makeOption("", "Choose a ticket type"));
  for (const t of ticketTypes) {
    let label = t.name + " - " + t.price + " € (" + t.seatsLeft + " left)";
    if (t.seatsLeft === 0) {
      label = t.name + " (sold out)";
    }
    const option = makeOption(t.id, label);
    option.disabled = t.seatsLeft === 0;
    select.append(option);
  }
}

/* rules that HTML attributes cannot express */

const rules = {
  date: function (field) {
    const event = findEvent(form.elements.eventId.value);
    if (event && event.soldOut.includes(field.value)) {
      return "Tickets for " + event.name + " on " + field.value + " are sold out.";
    }
    return "";
  },

  quantity: function (field) {
    const type = findType(form.elements.ticketType.value);
    if (type && Number(field.value) > type.seatsLeft) {
      return "Only " + type.seatsLeft + " " + type.name + " seats are left.";
    }
    return "";
  },

  fullName: function (field) {
    const words = field.value.trim().split(/\s+/);
    const onlyLetters = words.every(function (w) {
      return /^[A-Za-z\u00C0-\u024F\u0400-\u04FF'-]{2,}$/.test(w);
    });
    if (words.length < 2 || !onlyLetters) {
      return "Enter your first and last name, letters only.";
    }
    return "";
  },

  email: function (field) {
    if (!/^[^\s@]+@[^\s@.]+\.[^\s@.]+/.test(field.value)) {
      return "The email domain needs a dot, like name@mail.com.";
    }
    return "";
  },

  promo: function (field) {
    if (field.value.trim() !== "" && !findPromo(field.value)) {
      return "This promo code does not exist.";
    }
    return "";
  }
};

function builtInError(field) {
  const v = field.validity;
  if (v.valueMissing) {
    return "This field is required.";
  }
  if (v.typeMismatch) {
    return "Enter a valid email address.";
  }
  if (v.rangeUnderflow) {
    return field.type === "date" ? "The date cannot be in the past." : "The minimum is " + field.min + ".";
  }
  if (v.rangeOverflow) {
    return "The maximum is " + field.max + " tickets per order.";
  }
  if (v.stepMismatch || v.badInput) {
    return "Enter a whole number.";
  }
  return "";
}

function showError(field, message) {
  document.getElementById(field.id + "Error").textContent = message;
  field.setAttribute("aria-invalid", message === "" ? "false" : "true");
  field.classList.toggle("invalid", message !== "");
  field.classList.toggle("valid", message === "" && field.value.trim() !== "");
}

function clearError(field) {
  document.getElementById(field.id + "Error").textContent = "";
  field.removeAttribute("aria-invalid");
  field.classList.remove("invalid", "valid");
  field.setCustomValidity("");
}

function validateField(field) {
  field.setCustomValidity("");
  let message = builtInError(field);
  if (message === "" && rules[field.name]) {
    message = rules[field.name](field);
    if (message !== "") {
      field.setCustomValidity(message);
    }
  }
  showError(field, message);
  return message === "";
}

function updatePreview() {
  const f = form.elements;
  const event = findEvent(f.eventId.value);
  const type = findType(f.ticketType.value);
  const promo = findPromo(f.promo.value);
  const qty = Number(f.quantity.value);

  preview.event.textContent = event ? event.name : "-";
  preview.date.textContent = f.date.value || "-";
  preview.type.textContent = type ? type.name : "-";
  preview.qty.textContent = f.quantity.value || "-";
  preview.name.textContent = f.fullName.value.trim() || "-";
  preview.email.textContent = f.email.value.trim() || "-";

  if (promo) {
    preview.promo.textContent = promo.code + " (-" + promo.percent + "%)";
  } else {
    preview.promo.textContent = f.promo.value.trim() === "" ? "none" : "not valid";
  }

  const total = calcTotal(type, qty, promo);
  preview.total.textContent = total > 0 ? total + " €" : "-";
}

function showTicket(ticket) {
  const box = document.createElement("div");
  box.className = "ticket done";
  box.setAttribute("role", "status");

  const title = document.createElement("h2");
  title.textContent = "Booking confirmed";
  const code = document.createElement("p");
  code.className = "booking-code";
  code.textContent = ticket.code;

  const list = document.createElement("dl");
  const rows = [
    ["Event", ticket.event],
    ["Date", ticket.date],
    ["Type", ticket.type],
    ["Quantity", ticket.qty],
    ["Name", ticket.name],
    ["Email", ticket.email],
    ["Total", ticket.total + " €"]
  ];
  for (const row of rows) {
    const dt = document.createElement("dt");
    dt.textContent = row[0];
    const dd = document.createElement("dd");
    dd.textContent = row[1];
    list.append(dt, dd);
  }

  box.append(title, code, list);
  result.replaceChildren(box);
}

function handleInput(event) {
  const field = event.target;
  if (!field.name) {
    return;
  }
  if (touched.has(field)) {
    validateField(field);
  }
  if (field.name === "eventId" && touched.has(form.elements.date)) {
    validateField(form.elements.date);
  }
  if (field.name === "ticketType" && touched.has(form.elements.quantity)) {
    validateField(form.elements.quantity);
  }
  updatePreview();
}

form.addEventListener("input", handleInput);
form.addEventListener("change", handleInput);

form.addEventListener("focusout", function (event) {
  const field = event.target;
  if (!field.name) {
    return;
  }
  touched.add(field);
  validateField(field);
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  let errors = 0;
  let firstBad = null;
  for (const field of fields) {
    touched.add(field);
    if (!validateField(field)) {
      errors++;
      if (firstBad === null) {
        firstBad = field;
      }
    }
  }

  if (errors > 0) {
    summary.textContent =
      errors === 1 ? "1 error found. Fix it and try again." : errors + " errors found. Fix them and try again.";
    summary.classList.remove("hidden");
    result.replaceChildren();
    firstBad.focus();
    return;
  }

  summary.classList.add("hidden");
  summary.textContent = "";

  const f = form.elements;
  const type = findType(f.ticketType.value);
  const qty = Number(f.quantity.value);
  const ticket = {
    code: bookingCode(),
    event: findEvent(f.eventId.value).name,
    date: f.date.value,
    type: type.name,
    qty: qty,
    name: f.fullName.value.trim(),
    email: f.email.value.trim(),
    total: calcTotal(type, qty, findPromo(f.promo.value))
  };

  type.seatsLeft -= qty;

  form.reset();
  touched.clear();
  for (const field of fields) {
    clearError(field);
  }
  fillTypes();
  updatePreview();
  showTicket(ticket);
});

fillEvents();
fillTypes();
form.elements.date.min = todayString();
updatePreview();