async function loadSpotlights() {
  try {
    const res = await fetch("data/index_memebrs.json");
    const members = await res.json();

    // Filter Gold/Silver
    const filtered = members.filter(m => m.membershipLevel === "Gold" || m.membershipLevel === "Silver");

    // Shuffle and pick 2–3
    const random = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);

    const container = document.getElementById("spotlight-container");
    random.forEach(member => {
      const card = document.createElement("div");
      card.classList.add("spotlight-card");
      card.innerHTML = `
        <img src="${member.logo}" alt="${member.name} Logo">
        <h3>${member.name}</h3>
        <p>${member.phone}</p>
        <p>${member.address}</p>
        <a href="${member.website}" target="_blank">Visit Website</a>
        <p><strong>${member.membershipLevel} Member</strong></p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Spotlight error:", err);
  }
}

loadSpotlights();

// ...existing code...
async function loadSpotlights() {
  try {
    // fetch and render
  } catch (err) { /* ... */ }
}

// schedule spotlight after idle/load
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadSpotlights, { timeout: 2000 });
} else {
  window.addEventListener('load', loadSpotlights, { once: true });
}




const CACHE_NAME = 'konwea-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/index.css',
  '/scripts/weather.js',
  '/scripts/spotlight.js',
  '/scripts/directory.js',
  '/images/coins-1726618-800.webp',
  '/images/coins-1726618-1600.webp',
  '/images/shopping-6125344_640.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Cache-first for static assets
  const url = new URL(e.request.url);
  if (ASSETS.includes(url.pathname) || url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
  }
});