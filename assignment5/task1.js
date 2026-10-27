const LIVES = 3;
const WIN_STREAK = 10;
const BEST_KEY = "clarinsBestStreak";

const products = [
  { name: "Lip Perfector Rosewood", price: 27 },
  { name: "Lip Perfector Coral", price: 27 },
  { name: "Lip Perfector Nude", price: 29 },
  { name: "Lip Perfector Berry", price: 31 },
  { name: "Lip Comfort Oil Honey", price: 26 },
  { name: "Lip Comfort Oil Mint", price: 26 },
  { name: "Lip Comfort Oil Raspberry", price: 28 },
  { name: "Lip Comfort Oil Shimmer", price: 30 },
  { name: "Lip Liner Brown", price: 18 },
  { name: "Lip Liner Red", price: 18 },
  { name: "Lip Balm Care", price: 15 },
  { name: "Lip Scrub", price: 22 },
  { name: "Lip Mask Night", price: 24 },
  { name: "Gift Set Lips", price: 59 }
];

const livesEl = document.getElementById("lives");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const currentName = document.getElementById("currentName");
const currentPrice = document.getElementById("currentPrice");
const nextName = document.getElementById("nextName");
const nextPrice = document.getElementById("nextPrice");
const messageEl = document.getElementById("message");
const choices = document.getElementById("choices");
const restartBtn = document.getElementById("restart");
const choiceButtons = document.querySelectorAll("[data-choice]");

let lives;
let streak;
let best = loadBest();
let current;
let next;
let over;
let message = { text: "", type: "" };

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickProduct(exclude) {
  let item;
  do {
    item = products[randomInt(0, products.length - 1)];
  } while (item === exclude);
  return item;
}

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch (error) {
    return 0;
  }
}

function saveBest() {
  try {
    localStorage.setItem(BEST_KEY, best);
  } catch (error) {
    // storage is not available, the best streak just lives until reload
  }
}

function setMessage(text, type) {
  message = { text: text, type: type };
}

function render() {
  livesEl.textContent = "♥".repeat(lives) + "♡".repeat(LIVES - lives);
  streakEl.textContent = streak;
  bestEl.textContent = best;
  currentName.textContent = current.name;
  currentPrice.textContent = current.price + " €";
  nextName.textContent = next.name;
  nextPrice.textContent = over ? next.price + " €" : "?";
  messageEl.textContent = message.text;
  messageEl.className = "message " + message.type;
  for (const button of choiceButtons) {
    button.disabled = over;
  }
}

function startGame() {
  lives = LIVES;
  streak = 0;
  over = false;
  current = pickProduct(null);
  next = pickProduct(current);
  setMessage("New game. Is the next price higher or lower?", "");
  render();
}

function makeGuess(choice) {
  if (over) {
    setMessage("The game is over. Press Restart to play again.", "error");
    render();
    return;
  }
  if (choice !== "higher" && choice !== "lower") {
    setMessage("Choose Higher or Lower.", "error");
    render();
    return;
  }

  const right =
    (choice === "higher" && next.price >= current.price) ||
    (choice === "lower" && next.price <= current.price);
  const info = next.name + " costs " + next.price + " €. ";

  if (right) {
    streak++;
    if (streak > best) {
      best = streak;
      saveBest();
    }
    if (streak === WIN_STREAK) {
      over = true;
      setMessage(info + "You reached " + WIN_STREAK + " in a row. You win!", "win");
    } else {
      setMessage(info + "Correct!", "right");
    }
  } else {
    lives--;
    streak = 0;
    if (lives === 0) {
      over = true;
      setMessage(info + "Wrong. No lives left, game over.", "lose");
    } else {
      setMessage(info + "Wrong, you lose a life.", "wrong");
    }
  }

  if (!over) {
    current = next;
    next = pickProduct(current);
  }
  render();
}

choices.addEventListener("click", function (event) {
  const button = event.target.closest("[data-choice]");
  if (button) {
    makeGuess(button.dataset.choice);
  }
});

restartBtn.addEventListener("click", startGame);

startGame();