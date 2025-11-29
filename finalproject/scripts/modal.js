/// modal.js (ES module)
export function initModal() {
  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dlg => {
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
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = [...document.querySelectorAll('dialog')].find(d => d.open);
      if (open) open.close();
    }
  });
}
