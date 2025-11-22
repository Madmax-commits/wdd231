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
  
  document.getElementById('timestamp').value = timestamp;

  // Modal functionality
  const learnBtns = document.querySelectorAll('.learn-btn');
  
  learnBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.showModal();
      }
    });

    // Keyboard: Enter to open modal
    btn.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btn.click();
      }
    });
  });

  // Close modal buttons
  const closeButtons = document.querySelectorAll('.modal-close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('dialog').close();
    });

    // Keyboard: Escape closes modal (native)
    btn.addEventListener('keypress', (e) => {
      if (e.key === 'Escape') {
        btn.closest('dialog').close();
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

  // Form validation pattern
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

  // Form submission
  const form = document.querySelector('.membership-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      // Browser will validate required fields and patterns
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
      }
    });
  }
});
