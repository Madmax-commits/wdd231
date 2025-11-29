// contact.js (ES module)
export function initContact() {
  const form = document.getElementById('contactForm');
  const status = document.querySelector('.form-status');
  if (!form || !status) return;

  function setStatus(text, isError=false){
    status.textContent = text || '';
    status.style.color = isError ? '#ff6b6b' : 'var(--accent)';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      ts: new Date().toISOString()
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('Please fill in all required fields.', true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setStatus('Please enter a valid email address.', true);
      return;
    }

    try {
      const log = JSON.parse(localStorage.getItem('messages') || '[]');
      log.push(payload);
      localStorage.setItem('messages', JSON.stringify(log));
    } catch (err) {
      // localStorage may fail (private mode) — still continue
      console.warn('localStorage error', err);
    }

    // Redirect to action page with URLSearchParams
    const params = new URLSearchParams(payload);
    window.location.href = `form-action.html?${params.toString()}`;
  });
}
