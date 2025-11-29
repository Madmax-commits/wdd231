/// modal.js (ES module)
export function initModal() {
  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dlg => {
    // Wrap native showModal to record the previously focused element
    if (typeof dlg.showModal === 'function' && !dlg.__showModalWrapped) {
      const origShow = dlg.showModal.bind(dlg);
      dlg.showModal = function () {
        dlg.__previouslyFocused = document.activeElement;
        origShow();
        setupFocusTrap(dlg);
      };
      dlg.__showModalWrapped = true;
    }
    // click outside to close
    dlg.addEventListener('click', (e) => {
      const rect = dlg.getBoundingClientRect();
      const inDialog = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
      if (!inDialog) dlg.close();
    });

    // Close button
    const closeBtn = dlg.querySelector('.dialog-close');
    if (closeBtn) closeBtn.addEventListener('click', () => dlg.close());

    // When the dialog closes, restore focus and remove trap
    dlg.addEventListener('close', () => {
      teardownFocusTrap(dlg);
      try { if (dlg.__previouslyFocused && typeof dlg.__previouslyFocused.focus === 'function') dlg.__previouslyFocused.focus(); } catch (e) { }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = [...document.querySelectorAll('dialog')].find(d => d.open);
      if (open) open.close();
    }
  });
}

function setupFocusTrap(dlg) {
  const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
  const nodes = Array.from(dlg.querySelectorAll(focusableSelector)).filter(n => n.offsetWidth || n.offsetHeight || n.getClientRects().length);
  const first = nodes[0] || dlg.querySelector('.dialog-close');
  const last = nodes[nodes.length - 1] || first;

  function keyHandler(e) {
    if (e.key !== 'Tab') return;
    if (nodes.length === 0) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  dlg.__focusTrapHandler = keyHandler;
  dlg.addEventListener('keydown', keyHandler);

  // Initial focus
  try { (first || dlg).focus(); } catch (e) { }
}

function teardownFocusTrap(dlg) {
  if (dlg.__focusTrapHandler) {
    dlg.removeEventListener('keydown', dlg.__focusTrapHandler);
    delete dlg.__focusTrapHandler;
  }
}
