document.addEventListener('DOMContentLoaded', () => {
  // Set timestamp on page load
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const timestampInput = document.getElementById('timestamp');
  if (timestampInput) {
    timestampInput.value = timestamp;
  }

  // Modal functionality with accessibility
  const learnBtns = document.querySelectorAll('.learn-btn');
  
  learnBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal && modal.tagName === 'DIALOG') {
        modal.showModal();
        // Focus first focusable element in modal
        const firstFocusable = modal.querySelector('button, a, input, select, textarea');
        if (firstFocusable) firstFocusable.focus();
      }
    });
  });

  // Close modal buttons with keyboard support
  const closeButtons = document.querySelectorAll('.modal-close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('dialog');
      if (modal) modal.close();
    });

    // ESC key closes modal (native dialog behavior)
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = btn.closest('dialog');
        if (modal) modal.close();
      }
    });
  });

  // Close modal on backdrop click
  const modals = document.querySelectorAll('.membership-modal');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
  });

  // Form field validation
  const orgTitleInput = document.getElementById('orgTitle');
  if (orgTitleInput) {
    orgTitleInput.addEventListener('blur', () => {
      if (orgTitleInput.value && !orgTitleInput.validity.valid) {
        orgTitleInput.setCustomValidity('Please use only letters, hyphens, and spaces (minimum 7 characters)');
      } else {
        orgTitleInput.setCustomValidity('');
      }
    });
  }

  // Form submission handler
  const form = document.querySelector('.membership-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      // HTML5 validation will be performed by browser
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
      }
    });
  }

  // Hamburger menu (shared navigation)
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('#navMenu ul');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('show');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.textContent = isOpen ? '✖' : '☰';
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && e.target !== hamburger) {
        navMenu.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
        hamburger.focus();
      }
    });
  }

  // Update year and last modified
  const yearEl = document.getElementById('year');
  const lastModEl = document.getElementById('lastModified');
  
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  
  if (lastModEl) {
    lastModEl.textContent = new Date(document.lastModified).toLocaleString();
  }
});
