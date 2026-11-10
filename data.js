const products = [
  { id: 1, name: "Lip Perfector Berry", category: "perfector", shade: "Berry", price: 28, image: "images/perfector-berry.jpg", description: "Glossy, plumping lip balm in a berry tint." },
  { id: 2, name: "Lip Perfector Clay", category: "perfector", shade: "Clay", price: 28, image: "images/perfector-clay.jpg", description: "A soft nude with a clay finish." },
  { id: 3, name: "Lip Perfector Coral", category: "perfector", shade: "Coral", price: 28, image: "images/perfector-coral.jpg", description: "A fresh, juicy coral." },
  { id: 4, name: "Lip Perfector Peony", category: "perfector", shade: "Peony", price: 28, image: "images/perfector-peony.jpg", description: "A romantic pink with a shine." },
  { id: 5, name: "Lip Perfector Rosewood", category: "perfector", shade: "Rosewood", price: 28, image: "images/perfector-rosewood.jpg", description: "A deep dusty rose." },
  { id: 6, name: "Lip Oil Cherry", category: "oil", shade: "Cherry", price: 25, image: "images/oil-cherry.jpg", description: "Nourishing oil with a cherry tint." },
  { id: 7, name: "Lip Oil Honey", category: "oil", shade: "Honey", price: 25, image: "images/oil-honey.jpg", description: "Clear golden shine and comfort." },
  { id: 8, name: "Lip Oil Mahogany", category: "oil", shade: "Mahogany", price: 25, image: "images/oil-mahogany.jpg", description: "A rich, deep brown-red." },
  { id: 9, name: "Lip Oil Raspberry", category: "oil", shade: "Raspberry", price: 25, image: "images/oil-raspberry.jpg", description: "A bright raspberry shine." }
];

// Demo shipping costs in USD (not real carrier prices)
const countries = [
  { code: "KZ", name: "Kazakhstan", currency: "KZT", shipping: 4, days: "3-5" },
  { code: "US", name: "United States", currency: "USD", shipping: 12, days: "7-10" },
  { code: "GB", name: "United Kingdom", currency: "GBP", shipping: 9, days: "4-6" },
  { code: "FR", name: "France", currency: "EUR", shipping: 8, days: "4-6" },
  { code: "DE", name: "Germany", currency: "EUR", shipping: 8, days: "4-6" },
  { code: "TR", name: "Turkey", currency: "USD", shipping: 7, days: "5-7" },
  { code: "AE", name: "United Arab Emirates", currency: "USD", shipping: 10, days: "5-8" },
  { code: "UZ", name: "Uzbekistan", currency: "USD", shipping: 6, days: "4-6" },
  { code: "KR", name: "South Korea", currency: "USD", shipping: 11, days: "6-9" }
];

// Fixed, approximate demo rates (1 USD = ...). Not live rates.
const rates = { USD: 1, EUR: 0.92, GBP: 0.79, KZT: 480 };
const symbols = { USD: "$", EUR: "€", GBP: "£", KZT: "₸" };