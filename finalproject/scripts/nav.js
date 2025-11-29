// nav.js (ES module)
export function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  // Ensure baseline state
  nav.dataset.open = nav.dataset.open || 'false';
  toggle.setAttribute('aria-expanded', nav.dataset.open === 'true');

  toggle.addEventListener('click', () => {
    const isOpen = nav.dataset.open === 'true';
    nav.dataset.open = String(!isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close nav on resize to large screens
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Wayfinding: set aria-current on current link
  const anchors = nav.querySelectorAll('a');
  const path = location.pathname.split('/').pop() || 'index.html';
  anchors.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const cleanHref = href.split('/').pop();
    if (cleanHref === path) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
}
