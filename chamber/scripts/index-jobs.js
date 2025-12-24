/*
  index-jobs.js
  Loads ./data/jobs.json and displays the most recent 2 job postings
  Auto-updates when new jobs are added to the JSON file
*/

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('jobsContainer');
  if (!container) return;

  function createJobCard(job) {
    const article = document.createElement('article');
    article.className = 'job-card';

    const metaDiv = document.createElement('div');
    metaDiv.className = 'job-meta';

    const titleEl = document.createElement('h3');
    titleEl.className = 'job-title';
    titleEl.textContent = job.title || 'Untitled Position';

    const companyEl = document.createElement('p');
    companyEl.className = 'job-company';
    companyEl.innerHTML = `<strong>${job.company || 'Unknown Company'}</strong>`;

    const detailsEl = document.createElement('p');
    detailsEl.className = 'job-details';
    detailsEl.innerHTML = `
      <span class="job-location">📍 ${job.location || 'Remote'}</span>
      <span class="job-type" data-type="${(job.type || 'full-time').toLowerCase()}">
        ${job.type || 'Full-time'}
      </span>
    `;

    metaDiv.appendChild(titleEl);
    metaDiv.appendChild(companyEl);
    metaDiv.appendChild(detailsEl);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'job-content';

    if (job.description) {
      const descEl = document.createElement('p');
      descEl.className = 'job-description';
      descEl.textContent = job.description;
      contentDiv.appendChild(descEl);
    }

    if (job.salary) {
      const salaryEl = document.createElement('p');
      salaryEl.className = 'job-salary';
      salaryEl.innerHTML = `<strong>Salary:</strong> ${job.salary}`;
      contentDiv.appendChild(salaryEl);
    }

    const btnDiv = document.createElement('div');
    btnDiv.className = 'job-actions';

    const applyBtn = document.createElement('a');
    applyBtn.href = './jobs.html';
    applyBtn.className = 'btn btn-apply';
    applyBtn.textContent = 'Apply Now';
    applyBtn.setAttribute('aria-label', `Apply for ${job.title} position at ${job.company}`);

    btnDiv.appendChild(applyBtn);
    contentDiv.appendChild(btnDiv);

    article.appendChild(metaDiv);
    article.appendChild(contentDiv);
    return article;
  }

  async function loadAndRender() {
    try {
      const resp = await fetch('./data/jobs.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('Failed to load jobs.json');
      const data = await resp.json();

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="empty-state">No jobs available at the moment.</p>';
        return;
      }

      // Sort by postedAt date (most recent first) and take top 2
      const sorted = data
        .map(job => ({
          ...job,
          _postedAt: job.postedAt ? new Date(job.postedAt).getTime() : 0
        }))
        .sort((a, b) => b._postedAt - a._postedAt)
        .slice(0, 2);

      // Clear loading state and render jobs
      container.innerHTML = '';

      sorted.forEach(job => {
        const card = createJobCard(job);
        container.appendChild(card);
      });

    } catch (err) {
      console.error('index-jobs.js error:', err);
      container.innerHTML = '<p class="error-state">Unable to load jobs at this time.</p>';
    }
  }

  loadAndRender();

  // Optional: refresh jobs every 5 minutes
  setInterval(loadAndRender, 5 * 60 * 1000);
});
