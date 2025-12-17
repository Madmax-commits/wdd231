// scripts/discover.js
import places from '../data/places.mjs';

/* Build cards and append to grid */
function buildCards(items){
  const grid = document.getElementById('discover-grid');
  if (!grid || !Array.isArray(items)) return;

  items.forEach((item, index) => {
    const areaName = `card${index + 1}`;
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-area', areaName);
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-labelledby', `${escapeAttr(item.id)}-title`);

    // Template
    card.innerHTML = `
      <h3 id="${escapeAttr(item.id)}-title">${escapeHtml(item.name)}</h3>
      <figure>
        <img
          src="${escapeAttr(item.image)}"
          alt="${escapeAttr(item.alt || item.name)}"
          width="300" height="200"
          loading="lazy"
          decoding="async"
        />
      </figure>
      <address>${escapeHtml(item.address)}</address>
      <p>${escapeHtml(item.description)}</p>
      <div class="actions">
        <button class="button" data-id="${escapeAttr(item.id)}" aria-label="Learn more about ${escapeAttr(item.name)}">Learn more</button>
      </div>
    `;

    // Keyboard support: Enter/Space to trigger button
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        const btn = card.querySelector('.button');
        if (btn) btn.click();
      }
    });

    const btn = card.querySelector('.button');
    if (btn) {
      btn.addEventListener('click', () => {
        const itemData = items.find(p => p.id === item.id);
        if (itemData) {
          // Accessible alert as placeholder (could be replaced with modal)
          alert(`${itemData.name}\n\n${itemData.description}\n\nAddress: ${itemData.address}`);
        }
      });
    }

    grid.appendChild(card);
  });
}

/* LocalStorage visit message logic */
function handleVisitMessage(){
  const key = 'discover_last_visit';
  const now = Date.now();
  const stored = localStorage.getItem(key);
  const msgEl = document.getElementById('visit-message');
  
  if (!msgEl) return;

  if(!stored){
    msgEl.textContent = "Welcome! Let us know if you have any questions.";
  } else {
    const prev = Number(stored);
    if (Number.isNaN(prev)) {
      msgEl.textContent = "Welcome! Let us know if you have any questions.";
    } else {
      const dayMs = 24 * 60 * 60 * 1000;
      const diffMs = now - prev;
      if (diffMs < dayMs) {
        msgEl.textContent = "Back so soon! Awesome!";
      } else {
        const days = Math.floor(diffMs / dayMs);
        const dayWord = days === 1 ? 'day' : 'days';
        msgEl.textContent = `You last visited ${days} ${dayWord} ago.`;
      }
    }
  }

  try {
    localStorage.setItem(key, String(now));
  } catch (e) {
    // Silently fail if localStorage is blocked
    console.warn('localStorage unavailable:', e);
  }
}

/* Small sanitizers */
function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}
function escapeAttr(str){
  if(!str) return '';
  return String(str)
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

/* Initialize discover page */
document.addEventListener('DOMContentLoaded', () => {
  buildCards(places);
  handleVisitMessage();
});
