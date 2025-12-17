document.addEventListener('DOMContentLoaded', () => {
  // Extract and display query parameters
  const params = new URLSearchParams(window.location.search);

  const fieldMappings = {
    firstName: 'display-firstName',
    lastName: 'display-lastName',
    email: 'display-email',
    phone: 'display-phone',
    businessName: 'display-businessName',
    timestamp: 'display-timestamp'
  };

  // Safely populate displayed data
  Object.keys(fieldMappings).forEach(paramName => {
    const displayElementId = fieldMappings[paramName];
    const value = params.get(paramName) || '—';
    const displayElement = document.getElementById(displayElementId);
    
    if (displayElement) {
      displayElement.textContent = decodeURIComponent(value);
    }
  });

  // Update year and last modified
  const yearEl = document.getElementById('year');
  const lastModEl = document.getElementById('lastModified');
  
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  
  if (lastModEl) {
    lastModEl.textContent = new Date(document.lastModified).toLocaleString();
  }

  // Hamburger menu with accessibility
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('#navMenu ul');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('show');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.textContent = isOpen ? '✖' : '☰';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && e.target !== hamburger) {
        navMenu.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
        hamburger.focus();
      }
    });
  }
});
