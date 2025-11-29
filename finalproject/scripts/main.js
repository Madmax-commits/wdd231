// main.js (bootstrapping)
import { initNav } from './nav.js';
import { renderServices } from './services.js';
import { initContact } from './contact.js';
import { initModal } from './modal.js';

initNav();
initModal();

// Conditional initializers per page
if (document.getElementById('services')) {
  // renderServices will be called if #services exists (services.html)
  renderServices();
}

// Contact page initializer
if (document.getElementById('contact')) {
  initContact();
}
