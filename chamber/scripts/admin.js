// Admin client script: submits form data to POST /api/jobs with Authorization
// The script is intentionally small and commented so you can read each step.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminForm');
  const status = document.getElementById('status');
  const jobsList = document.getElementById('jobsList');

  // Load the current jobs for admin management (DELETE)
  async function loadJobsList() {
    jobsList.textContent = 'Loading...';
    try {
      const res = await fetch('/api/jobs', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const list = await res.json();
      renderJobsList(list);
    } catch (err) {
      jobsList.textContent = 'Could not load jobs.';
      console.error('loadJobsList error', err);
    }
  }

  function renderJobsList(list) {
    if (!Array.isArray(list) || list.length === 0) {
      jobsList.innerHTML = '<p>No jobs available.</p>';
      return;
    }
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    list.forEach(job => {
      const li = document.createElement('li');
      li.style.border = '1px solid #ddd';
      li.style.padding = '0.5rem';
      li.style.marginBottom = '0.5rem';
      li.innerHTML = `<strong>${escapeHtml(job.title)}</strong> — ${escapeHtml(job.company)} <br> <small>Posted: ${escapeHtml(job.postedAt || '')}</small>`;
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.style.marginLeft = '1rem';
      del.addEventListener('click', () => deleteJob(job.id));
      li.appendChild(del);
      ul.appendChild(li);
    });
    jobsList.innerHTML = '';
    jobsList.appendChild(ul);
  }

  // Simple HTML escape
  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"})[c]); }

  // Delete a job via DELETE /api/jobs/:id — requires admin token
  async function deleteJob(id) {
    const token = form.querySelector('[name="adminToken"]').value;
    if (!token) { alert('Enter admin token above to delete.'); return; }
    if (!confirm('Delete this job?')) return;
    try {
      const res = await fetch('/api/jobs/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await loadJobsList();
      status.textContent = `Deleted job ${id}`;
    } catch (err) {
      status.textContent = `Delete error: ${err.message}`;
      console.error('deleteJob error', err);
    }
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Build job object from form fields
    const fd = new FormData(form);
    const job = {
      title: fd.get('title'),
      company: fd.get('company'),
      location: fd.get('location'),
      type: fd.get('type'),
      description: fd.get('description'),
      link: fd.get('link') || '#',
      posterEmail: fd.get('posterEmail') || null,
      requirements: fd.get('requirements') || '',
      salary: fd.get('salary') || '',
      cvRequired: fd.get('cvRequired') === 'on'
    };

    // Read the admin token from the form - this will be sent in the Authorization header
    const token = fd.get('adminToken');

    status.textContent = 'Submitting...';

    try {
      // Send POST request to the server API
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(job)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }

      const created = await res.json();
      status.textContent = `Created job #${created.id} — refresh jobs page to see it.`;
      form.reset();
      // Refresh admin jobs list so the new job appears
      await loadJobsList();
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      console.error('Admin submit error', err);
    }
  });

  // Initial load of jobs listing for admin management
  loadJobsList();
});
