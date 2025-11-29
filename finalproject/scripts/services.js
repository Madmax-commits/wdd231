/// services.js (ES module)
export async function renderServices() {
  const grid = document.querySelector('.service-grid');
  if (!grid) return;

  try {
    const res = await fetch('data/services.json');
    if (!res.ok) throw new Error('Network error fetching services');
    const items = await res.json();

    // Guards: ensure array
    if (!Array.isArray(items) || items.length === 0) {
      grid.innerHTML = `<p class="error">No services available.</p>`;
      return;
    }

    // Group by category using reduce
    const grouped = items.reduce((acc, it) => {
      const cat = it.category || 'Other';
      acc[cat] = acc[cat] || [];
      acc[cat].push(it);
      return acc;
    }, {});

    // Render sections
    grid.innerHTML = Object.entries(grouped).map(([cat, list]) => `
      <section class="service-section">
        <h2>${cat} <small class="muted">(${list.length})</small></h2>
        <div class="service-cards">
          ${list.map(s => `
            <article class="service-card" role="listitem" tabindex="0" aria-labelledby="${s.name.toLowerCase().replace(/\s+/g, '-')}-title">
              <h3 id="${s.name.toLowerCase().replace(/\s+/g, '-')}-title">${s.name}</h3>
              <ul>
                <li><strong>Category:</strong> ${s.category}</li>
                <li><strong>Complexity:</strong> ${s.complexity}</li>
                <li><strong>Delivery:</strong> ${s.delivery}</li>
                <li><strong>ID:</strong> ${s.name.toLowerCase().replace(/\s+/g, '-')}</li>
              </ul>
              <button class="details-btn" type="button" data-service='${JSON.stringify(s).replaceAll("'", "&apos;")}'>Details</button>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');

    // Attach events for details buttons
    grid.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const raw = btn.getAttribute('data-service').replaceAll('&apos;', "'");
        const data = JSON.parse(raw);
        const dlg = document.getElementById('details-dialog');
        dlg.querySelector('.details-content').innerHTML = `
          <h3>${escapeHTML(data.name)}</h3>
          <p><strong>Category:</strong> ${escapeHTML(data.category)}</p>
          <p><strong>Complexity:</strong> ${escapeHTML(data.complexity)}</p>
          <p><strong>Delivery:</strong> ${escapeHTML(data.delivery)}</p>
          <p><small>ID: ${escapeHTML(data.name.toLowerCase().replace(/\s+/g, '-'))}</small></p>
        `;
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');
      });
    });

    // Show only first 3 service cards initially, add a "More services" toggle
    const cards = Array.from(grid.querySelectorAll('.service-card'));
    if (cards.length > 3) {
      grid.id = grid.id || 'service-grid';
      // hide cards after the first 3
      cards.forEach((c, i) => {
        if (i >= 3) {
          c.classList.add('collapsed');
          c.style.display = 'none';
        }
      });

      // hide any section that contains no visible cards
      const sections = Array.from(grid.querySelectorAll('.service-section'));
      sections.forEach(sec => {
        const hasVisible = Array.from(sec.querySelectorAll('.service-card')).some(card => card.style.display !== 'none');
        if (!hasVisible) sec.style.display = 'none';
      });

      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'more-services';
      moreBtn.textContent = 'More services';
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.setAttribute('aria-controls', grid.id);

      // Insert button after the grid
      grid.parentNode.insertBefore(moreBtn, grid.nextSibling);

      moreBtn.addEventListener('click', () => {
        const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
          // show remaining
          cards.forEach((c, i) => { if (i >= 3) c.style.display = ''; });
          // show all sections
          sections.forEach(sec => { sec.style.display = ''; });
          moreBtn.textContent = 'Show fewer services';
          moreBtn.setAttribute('aria-expanded', 'true');
          // move focus to first revealed card
          const firstRevealed = cards[3];
          if (firstRevealed && typeof firstRevealed.focus === 'function') firstRevealed.focus();
        } else {
          // hide remaining
          cards.forEach((c, i) => { if (i >= 3) c.style.display = 'none'; });
          // hide sections that now have no visible cards
          sections.forEach(sec => {
            const hasVisible = Array.from(sec.querySelectorAll('.service-card')).some(card => card.style.display !== 'none');
            if (!hasVisible) sec.style.display = 'none';
          });
          moreBtn.textContent = 'More services';
          moreBtn.setAttribute('aria-expanded', 'false');
          moreBtn.focus();
        }
      });
    }

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="error">Unable to load services. Please try again later.</p>`;
  }
}

function escapeHTML(s) { return (s || '').toString().replaceAll('<', '&lt;').replaceAll('>', '&gt;') }
