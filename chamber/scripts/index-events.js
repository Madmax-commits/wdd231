/*
  index-events.js
  Loads ./data/events.json and renders the two nearest upcoming events
  Uses the existing styles in styles/index.css (.events > article layout)
*/

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.events');
  if (!container) return; // nothing to do on pages without the events block

  const loadingNode = document.createElement('p');
  loadingNode.className = 'loading-text';
  loadingNode.textContent = 'Loading events...';
  container.appendChild(loadingNode);

  function formatDateTime(dateStr, timeStr) {
    if (!dateStr) return '';
    try {
      // Parse date (YYYY-MM-DD) and time (HH:MM) and combine
      const combined = timeStr ? `${dateStr}T${timeStr}` : dateStr;
      const dt = new Date(combined);
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' };
      return dt.toLocaleString(undefined, options);
    } catch (e) {
      return dateStr;
    }
  }

  function createArticle(event) {
    const article = document.createElement('article');
    article.className = 'event-card';

    const metaDiv = document.createElement('div');
    metaDiv.className = 'meta';

    const timeEl = document.createElement('time');
    // Construct datetime attribute from date + time
    const datetimeAttr = event.time ? `${event.date}T${event.time}` : event.date;
    if (datetimeAttr) timeEl.setAttribute('datetime', datetimeAttr);
    timeEl.textContent = formatDateTime(event.date, event.time);
    metaDiv.appendChild(timeEl);

    if (event.location) {
      const place = document.createElement('span');
      place.className = 'place';
      place.textContent = event.location;
      metaDiv.appendChild(place);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    const h3 = document.createElement('h3');
    h3.textContent = event.title || 'Untitled Event';
    contentDiv.appendChild(h3);

    if (event.description) {
      const p = document.createElement('p');
      p.textContent = event.description;
      contentDiv.appendChild(p);
    }

    const cta = document.createElement('a');
    cta.className = 'event-cta';
    cta.href = '#';
    cta.textContent = 'Learn More';
    contentDiv.appendChild(cta);

    article.appendChild(metaDiv);
    article.appendChild(contentDiv);
    return article;
  }

  async function loadAndRender() {
    try {
      const resp = await fetch('./data/events.json', {cache: 'no-store'});
      if (!resp.ok) throw new Error('Failed to load events.json');
      const data = await resp.json();

      const now = new Date();

      // normalize events with parseable date and filter upcoming (>= now)
      const normalized = (data || [])
        .map(e => {
          // Parse date + time fields (YYYY-MM-DD and HH:MM)
          let dt = null;
          if (e.date && e.time) {
            dt = new Date(`${e.date}T${e.time}`);
          } else if (e.date) {
            dt = new Date(e.date);
          }

          return Object.assign({}, e, { _date: dt && !isNaN(dt) ? dt : null });
        })
        .filter(e => e._date && e._date.getTime() >= now.getTime());

      // if no upcoming events found, include all events and sort by date
      let selection = normalized.sort((a,b)=>a._date - b._date).slice(0,2);

      // If still empty, fall back to first two events from file
      if (selection.length === 0) selection = (data || []).slice(0,2);

      // clear loading node and existing articles
      container.querySelectorAll('.event-card, .loading-text, .empty-state').forEach(n => n.remove());

      if (!selection || selection.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No upcoming events — check back soon.';
        container.appendChild(empty);
        return;
      }

      selection.forEach(ev => {
        const art = createArticle(ev);
        container.appendChild(art);
      });

    } catch (err) {
      console.error('index-events.js error:', err);
      container.querySelectorAll('.loading-text').forEach(n => n.remove());
      const errNode = document.createElement('div');
      errNode.className = 'empty-state';
      errNode.textContent = 'Unable to load events at this time.';
      container.appendChild(errNode);
    }
  }

  loadAndRender();
});
