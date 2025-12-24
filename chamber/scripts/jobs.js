/**
 * Jobs Page Module
 * Handles job listing, filtering, and pagination
 */

class JobsManager {
    constructor() {
        // jobs will be loaded from external JSON
        this.allJobs = [];
        this.filteredJobs = [];
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this._pollInterval = null;

        this.initializeElements();
        this.attachEventListeners();
        this.loadAndStart();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.filterForm = document.getElementById('filterForm');
        this.keywordInput = document.getElementById('keywordInput');
        this.locationSelect = document.getElementById('locationSelect');
        this.jobTypeSelect = document.getElementById('jobTypeSelect');
        this.timeframeSelect = document.getElementById('timeframeSelect');
        this.jobsContainer = document.getElementById('jobsContainer');
        this.paginationContainer = document.getElementById('paginationContainer');
        this.jobCount = document.getElementById('jobCount');
        this.loadingState = document.getElementById('loadingState');
        this.emptyState = document.getElementById('emptyState');

        // Create modal container for viewing job details and applying
        this.createModal();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.currentPage = 1;
            this.applyFilters();
            this.render();
        });

        this.filterForm.addEventListener('reset', () => {
            setTimeout(() => {
                this.currentPage = 1;
                this.filteredJobs = [...this.allJobs];
                this.render();
            }, 0);
        });
        // When timeframe changes, apply filters immediately
        if (this.timeframeSelect) {
            this.timeframeSelect.addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); this.render(); });
        }
    }

    /**
     * Apply filters based on user input
     */
    applyFilters() {
        const keyword = this.keywordInput.value.toLowerCase().trim();
        const location = this.locationSelect.value;
        const jobType = this.jobTypeSelect.value;
        const timeframe = this.timeframeSelect ? this.timeframeSelect.value : '';

        this.filteredJobs = this.allJobs.filter(job => {
            const matchesKeyword = 
                job.title.toLowerCase().includes(keyword) ||
                job.company.toLowerCase().includes(keyword) ||
                job.description.toLowerCase().includes(keyword);

            const matchesLocation = !location || job.location === location;
            const matchesType = !jobType || job.type === jobType;

            // Timeframe filtering - check postedAt timestamp if present
            let matchesTime = true;
            if (timeframe && job.postedAt) {
                const now = Date.now();
                const posted = Date.parse(job.postedAt);
                if (Number.isNaN(posted)) matchesTime = false;
                else {
                    const diffMs = now - posted;
                    const diffHours = diffMs / (1000 * 60 * 60);
                    const diffDays = diffMs / (1000 * 60 * 60 * 24);
                    switch (timeframe) {
                        case '1h': matchesTime = diffHours <= 1; break;
                        case '2h': matchesTime = diffHours <= 2; break;
                        case '24h': matchesTime = diffHours <= 24; break;
                        case '7d': matchesTime = diffDays <= 7; break;
                        case '30d': matchesTime = diffDays <= 30; break;
                        default: matchesTime = true;
                    }
                }
            }

            return matchesKeyword && matchesLocation && matchesType && matchesTime;
        });
    }

    /**
     * Get paginated jobs
     */
    getPaginatedJobs() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredJobs.slice(startIndex, endIndex);
    }

    /**
     * Get total pages
     */
    getTotalPages() {
        return Math.ceil(this.filteredJobs.length / this.itemsPerPage);
    }

    /**
     * Render job cards
     */
    renderJobCards() {
        this.jobsContainer.innerHTML = '';
        const paginatedJobs = this.getPaginatedJobs();

        if (paginatedJobs.length === 0) {
            this.jobsContainer.style.display = 'none';
            this.emptyState.hidden = false;
            return;
        }

        this.jobsContainer.style.display = 'flex';
        this.emptyState.hidden = true;

        paginatedJobs.forEach(job => {
            const jobCard = this.createJobCard(job);
            this.jobsContainer.appendChild(jobCard);
        });

        // Attach handlers for 'View Job' buttons
        this.jobsContainer.querySelectorAll('.view-job').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(btn.getAttribute('data-id'));
                this.openJobModal(id);
            });
        });
    }

    /**
     * Create a job card element
     */
    createJobCard(job) {
        const article = document.createElement('article');
        article.className = 'job-card';
        article.setAttribute('data-job-id', job.id);

        const locationLabel = this.formatLocation(job.location);
        const typeLabel = this.formatJobType(job.type);
        const postedLabel = job.postedAt ? this.timeAgo(job.postedAt) : '';

        article.innerHTML = `
            <h3>${this.escapeHtml(job.title)}</h3>
            <p class="company">${this.escapeHtml(job.company)}</p>
            <div class="job-meta">
                <span>📍 ${locationLabel}</span>
                <span>💼 ${typeLabel}</span>
                ${postedLabel ? `<span>🕒 ${this.escapeHtml(postedLabel)}</span>` : ''}
            </div>
            <p class="job-description">${this.escapeHtml(job.description)}</p>
            <button type="button" class="btn btn-primary view-job" data-id="${job.id}">View Job</button>
        `;

        return article;
    }

    /**
     * Human friendly time-ago string for a postedAt ISO string
     */
    timeAgo(iso) {
        const t = Date.parse(iso);
        if (Number.isNaN(t)) return '';
        const diff = Date.now() - t;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    /**
     * Render pagination
     */
    renderPagination() {
        this.paginationContainer.innerHTML = '';
        const totalPages = this.getTotalPages();

        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Previous';
        prevBtn.type = 'button';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => this.goToPage(this.currentPage - 1);
        this.paginationContainer.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.type = 'button';
            btn.className = this.currentPage === i ? 'active' : '';
            btn.onclick = () => this.goToPage(i);
            this.paginationContainer.appendChild(btn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next →';
        nextBtn.type = 'button';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.onclick = () => this.goToPage(this.currentPage + 1);
        this.paginationContainer.appendChild(nextBtn);
    }

    /**
     * Go to specific page
     */
    goToPage(page) {
        const totalPages = this.getTotalPages();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Update job count
     */
    updateJobCount() {
        const total = this.filteredJobs.length;
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, total);

        this.jobCount.textContent = `Showing ${start}-${end} of ${total} job${total !== 1 ? 's' : ''}`;
    }

    /**
     * Format location display
     */
    formatLocation(location) {
        const locations = {
            'asaba': 'Asaba',
            'remote': 'Remote',
            'hybrid': 'Hybrid'
        };
        return locations[location] || location;
    }

    /**
     * Format job type display
     */
    formatJobType(type) {
        const types = {
            'full-time': 'Full-time',
            'part-time': 'Part-time',
            'contract': 'Contract'
        };
        return types[type] || type;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        const s = String(text || '');
        return s.replace(/[&<>\"']/g, m => map[m]);
    }

    /**
     * Create modal DOM used for job details and application form
     */
    createModal() {
        // Modal wrapper
        const modal = document.createElement('div');
        modal.id = 'jobModal';
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.display = 'none';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '9999';

        modal.innerHTML = `
            <div id="jobModalCard" style="background:white;max-width:820px;width:92%;border-radius:12px;padding:1rem;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <button id="jobModalClose" style="float:right">Close</button>
                <h2 id="modalTitle"></h2>
                <p id="modalCompany" style="font-weight:700;color:#094;">&nbsp;</p>
                <div id="modalMeta" style="color:#666;margin-bottom:0.5rem"></div>
                <div id="modalDescription" style="margin:0.5rem 0"></div>
                <div id="modalRequirements" style="margin:0.5rem 0;color:#444"></div>
                <div id="modalSalary" style="margin:0.5rem 0;color:#444"></div>
                <div id="modalApplyArea" style="margin-top:1rem"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // close handler
        modal.querySelector('#jobModalClose').addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

        this._modal = modal;
    }

    /**
     * Open modal populated with job data and application form
     */
    openJobModal(id) {
        const job = this.allJobs.find(j => Number(j.id) === id) || this.filteredJobs.find(j => Number(j.id) === id);
        if (!job) return alert('Job not found');
        const modal = this._modal;
        modal.style.display = 'flex';
        modal.querySelector('#modalTitle').textContent = job.title;
        modal.querySelector('#modalCompany').textContent = job.company;
        modal.querySelector('#modalMeta').innerHTML = `📍 ${this.escapeHtml(this.formatLocation(job.location))} &nbsp; • &nbsp; ${this.escapeHtml(this.formatJobType(job.type))} &nbsp; • &nbsp; ${this.escapeHtml(job.postedAt ? this.timeAgo(job.postedAt) : '')}`;
        modal.querySelector('#modalDescription').innerHTML = `<strong>Description</strong><p>${this.escapeHtml(job.description)}</p>`;
        modal.querySelector('#modalRequirements').innerHTML = job.requirements ? `<strong>Requirements</strong><p>${this.escapeHtml(job.requirements)}</p>` : '';
        modal.querySelector('#modalSalary').innerHTML = job.salary ? `<strong>Compensation</strong><p>${this.escapeHtml(job.salary)}</p>` : '';

        // Build apply area: single shared apply page handles the application flow.
        const applyArea = modal.querySelector('#modalApplyArea');
        applyArea.innerHTML = '';
        const applyBtn = document.createElement('button');
        applyBtn.className = 'btn btn-primary';
        applyBtn.textContent = 'Apply';
        applyArea.appendChild(applyBtn);

        // Navigate to the shared apply page. The apply page reads jobId and
        // displays the form based on that job's requirements (CV required etc.).
        applyBtn.addEventListener('click', () => {
            // jobs.html and apply.html are in same folder (chamber), so use relative path
            window.location.href = `./apply.html?jobId=${encodeURIComponent(job.id)}`;
        });
    }

    buildApplyFormHtml(job) {
        // If CV is required, include file input
        const cvField = job.cvRequired ? `<label>CV / Resume (PDF/DOC):</label><input type="file" name="cv" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">` : '';
        return `
            <form enctype="multipart/form-data">
              <label>Your email</label>
              <input name="applicantEmail" type="email" required>
              <label>Contact number</label>
              <input name="contactNumber" type="text" required>
              <label>Message (optional)</label>
              <textarea name="message"></textarea>
              ${cvField}
              <div style="margin-top:0.5rem">
                <button type="submit" class="btn btn-primary">Send Application</button>
              </div>
              <p id="applyStatus" aria-live="polite"></p>
            </form>
        `;
    }

    async submitApplication(jobId, form) {
        const statusEl = form.querySelector('#applyStatus');
        statusEl.textContent = 'Submitting...';
        try {
            const fd = new FormData(form);
            const res = await fetch(`/api/jobs/${jobId}/apply`, { method: 'POST', body: fd });
            const text = await res.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
            if (!res.ok) throw new Error(data.error || res.statusText || 'Failed to submit');
            statusEl.textContent = data.sent ? 'Application sent to employer.' : 'Application saved locally.';
            form.reset();
        } catch (err) {
            statusEl.textContent = 'Error: ' + err.message;
            console.error('submitApplication error', err);
        }
    }

    /**
     * Load jobs JSON from `data/jobs.json`
     */
    async loadJobs() {
        try {
            this.loadingState.style.display = 'block';
            // Try the API first (if server is running). If it fails, fall back to the static JSON file.
            let res;
            try {
                res = await fetch('/api/jobs', { cache: 'no-store' });
                if (!res.ok) throw new Error('API returned ' + res.status);
            } catch (apiErr) {
                // API not available — fetch the local static JSON
                res = await fetch('data/jobs.json', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to load local jobs.json');
            }
            const data = await res.json();
            this.allJobs = Array.isArray(data) ? data : [];
            this.applyFilters();
            this.render();
        } catch (err) {
            console.error('Jobs load error', err);
        } finally {
            this.loadingState.style.display = 'none';
        }
    }

    /**
     * Start initial load and polling for updates
     */
    async loadAndStart() {
        await this.loadJobs();
        // poll every 60 seconds
        this._pollInterval = setInterval(() => this.loadJobs(), 60000);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this._pollInterval) { clearInterval(this._pollInterval); this._pollInterval = null; }
            } else {
                if (!this._pollInterval) this._pollInterval = setInterval(() => this.loadJobs(), 60000);
            }
        });
        window.addEventListener('beforeunload', () => this.stopPolling());
    }

    stopPolling() {
        if (this._pollInterval) { clearInterval(this._pollInterval); this._pollInterval = null; }
    }

    /**
     * Main render method
     */
    render() {
        this.loadingState.style.display = 'none';
        this.renderJobCards();
        this.renderPagination();
        this.updateJobCount();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new JobsManager();
});
