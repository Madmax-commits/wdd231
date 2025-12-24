// apply.js — populate apply form based on jobId and job requirements
// The page is shared across all jobs; jobId is passed as ?jobId=ID

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const jobId = params.get('jobId');
  const titleEl = document.getElementById('jobTitle');
  const companyEl = document.getElementById('jobCompany');
  const metaEl = document.getElementById('jobMeta');
  const detailsEl = document.getElementById('jobDetails');
  const cvField = document.getElementById('cvField');
  const form = document.getElementById('applyForm');
  const status = document.getElementById('applyStatus');

  if (!jobId) {
    titleEl.textContent = 'No job selected';
    return;
  }

  // Fetch job data from API or fall back to static file
  async function loadJob() {
    try {
      let res;
      try { res = await fetch(`/api/jobs`, { cache: 'no-store' }); if (!res.ok) throw new Error('API'); }
      catch (e) { res = await fetch('data/jobs.json', { cache: 'no-store' }); }
      const list = await res.json();
      const job = (list || []).find(j => String(j.id) === String(jobId));
      if (!job) { titleEl.textContent = 'Job not found'; return; }
      renderJob(job);
    } catch (err) {
      console.error('loadJob error', err);
      titleEl.textContent = 'Failed to load job';
    }
  }

  function renderJob(job) {
    titleEl.textContent = job.title;
    companyEl.textContent = job.company;
    metaEl.textContent = `📍 ${job.location || ''} • ${job.type || ''} • ${job.postedAt ? new Date(job.postedAt).toLocaleDateString() : ''}`;
    detailsEl.innerHTML = `<h3>Description</h3><p>${escapeHtml(job.description || '')}</p>` + (job.requirements ? `<h4>Requirements</h4><p>${escapeHtml(job.requirements)}</p>` : '') + (job.salary ? `<h4>Compensation</h4><p>${escapeHtml(job.salary)}</p>` : '');

    // If CV required, show file input
    if (job.cvRequired) {
      cvField.innerHTML = `<label>CV / Resume (PDF or DOC)</label><input type="file" name="cv" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required>`;
    } else {
      cvField.innerHTML = `<p class="note">CV is not required for this job.</p>`;
    }

    // On submit, POST to server apply endpoint
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = 'Submitting...';
      try {
        const fd = new FormData(form);
        const res = await fetch(`/api/jobs/${encodeURIComponent(job.id)}/apply`, { method: 'POST', body: fd });
        // Some servers may return empty bodies or non-JSON on error — handle safely
        const text = await res.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
        if (!res.ok) throw new Error(data.error || res.statusText || 'Failed to submit');
        status.textContent = data.sent ? 'Application sent to employer.' : 'Application saved locally.';
        form.reset();
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
        console.error('apply submit error', err);
      }
    });
  }

  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"})[c]); }

  loadJob();
});
