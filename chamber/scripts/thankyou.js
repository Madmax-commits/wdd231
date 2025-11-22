document.addEventListener('DOMContentLoaded', () => {
  // Extract query parameters from URL
  const params = new URLSearchParams(window.location.search);

  // Map of parameter names to display element IDs
  const fieldMappings = {
    firstName: 'display-firstName',
    lastName: 'display-lastName',
    email: 'display-email',
    phone: 'display-phone',
    businessName: 'display-businessName',
    timestamp: 'display-timestamp'
  };

  // Populate displayed data
  Object.keys(fieldMappings).forEach(paramName => {
    const displayElementId = fieldMappings[paramName];
    const value = params.get(paramName) || '—';
    const displayElement = document.getElementById(displayElementId);
    
    if (displayElement) {
      displayElement.textContent = decodeURIComponent(value);
    }
  });

  // Update year and last modified (from directory.js)
  const yearEl = document.getElementById('year');
  const lastModEl = document.getElementById('lastModified');
  
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  
  if (lastModEl) {
    lastModEl.textContent = new Date(document.lastModified).toLocaleString();
  }

  // Hamburger menu (copied from directory.js)
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('#navMenu ul');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('show');
      hamburger.textContent = navMenu.classList.contains('show') ? '✖' : '☰';
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && e.target !== hamburger) {
        navMenu.classList.remove('show');
        hamburger.textContent = '☰';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        hamburger.textContent = '☰';
      }
    });
  }
});
