/**
 * Events Page Module
 * Handles event listings and proposal form submissions
 */

class EventsManager {
    constructor() {
        // events will be loaded from data/events.json or API
        this.events = [];
        this._modal = null;

        this.initializeElements();
        this.attachEventListeners();
        this.loadAndRender();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.eventsContainer = document.getElementById('eventsContainer');
        this.eventCount = document.getElementById('eventCount');
        this.loadingState = document.getElementById('loadingState');
        this.emptyState = document.getElementById('emptyState');
        this.proposalForm = document.getElementById('proposalForm');
        this.successMessage = document.getElementById('successMessage');
        this.createEventModal();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.proposalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        this.proposalForm.addEventListener('reset', () => {
            this.clearFormErrors();
            this.successMessage.hidden = true;
        });
    }

    /**
     * Render events
     */
    renderEvents() {
        this.eventsContainer.innerHTML = '';

        if (this.events.length === 0) {
            this.eventsContainer.style.display = 'none';
            this.emptyState.hidden = false;
            return;
        }

        this.eventsContainer.style.display = 'grid';
        this.emptyState.hidden = true;

        this.events.forEach(event => {
            const eventCard = this.createEventCard(event);
            this.eventsContainer.appendChild(eventCard);
        });

        // attach click handlers to view-event buttons
        this.eventsContainer.querySelectorAll('.view-event').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.getAttribute('data-id'));
                this.openEventModal(id);
            });
        });
    }

    /**
     * Create event card element
     */
    createEventCard(event) {
        const article = document.createElement('article');
        article.className = 'event-card';
        article.setAttribute('data-event-id', event.id);

        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        article.innerHTML = `
            <time datetime="${event.date}">📅 ${formattedDate} · ${event.time}</time>
            <h3>${this.escapeHtml(event.title)}</h3>
            <p>${this.escapeHtml(event.description)}</p>
            <div class="event-location">
                <span>📍 ${this.escapeHtml(event.location)}</span>
            </div>
            <button type="button" class="btn btn-primary view-event" data-id="${event.id}">View More</button>
        `;

        return article;
    }

    /**
     * Update event count
     */
    updateEventCount() {
        const count = this.events.length;
        this.eventCount.textContent = `${count} event${count !== 1 ? 's' : ''} coming up`;
    }

    /**
     * Handle form submission
     */
    handleFormSubmit() {
        this.clearFormErrors();

        // Get form values
        const formData = {
            organizationName: document.getElementById('organizationName').value.trim(),
            email: document.getElementById('email').value.trim(),
            eventTitle: document.getElementById('eventTitle').value.trim(),
            eventDate: document.getElementById('eventDate').value,
            proposalDetails: document.getElementById('proposalDetails').value.trim()
        };

        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        // Show success message
        this.proposalForm.reset();
        this.successMessage.hidden = false;
        this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide success message after 5 seconds
        setTimeout(() => {
            this.successMessage.hidden = true;
        }, 5000);

        // In production, send data to server
        console.log('Form submitted:', formData);
        this.logFormData(formData);
    }

    /**
     * Validate form data
     */
    validateForm(data) {
        let isValid = true;

        // Validate organization name
        if (!data.organizationName) {
            this.showFieldError('organizationName', 'Organization name is required');
            isValid = false;
        }

        // Validate email
        if (!data.email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate event title
        if (!data.eventTitle) {
            this.showFieldError('eventTitle', 'Event title is required');
            isValid = false;
        }

        // Validate proposal details
        if (!data.proposalDetails) {
            this.showFieldError('proposalDetails', 'Proposal details are required');
            isValid = false;
        } else if (data.proposalDetails.length < 10) {
            this.showFieldError('proposalDetails', 'Please provide more details (at least 10 characters)');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        const formGroup = field.closest('.form-group');

        formGroup.classList.add('error');
        errorElement.textContent = message;
    }

    /**
     * Clear form errors
     */
    clearFormErrors() {
        const formGroups = this.proposalForm.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error');
            const errorElement = group.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    }

    /**
     * Check if email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Log form data (for demonstration)
     */
    logFormData(data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...data
        };
        console.log('📋 Proposal submitted:', logEntry);
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
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Create event modal for viewing event details
     */
    createEventModal() {
        // Check if modal already exists
        if (document.getElementById('eventModal')) {
            this._modal = document.getElementById('eventModal');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'eventModal';
        modal.className = 'modal';
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button type="button" class="modal-close" aria-label="Close event details">&times;</button>
                    <h2 id="modalEventTitle"></h2>
                    <div class="modal-body">
                        <div class="event-meta">
                            <p><strong>📅 Date:</strong> <span id="modalEventDate"></span></p>
                            <p><strong>⏰ Time:</strong> <span id="modalEventTime"></span></p>
                            <p><strong>📍 Location:</strong> <span id="modalEventLocation"></span></p>
                        </div>
                        <div id="modalEventDescription"></div>
                        <div class="event-requirements">
                            <h4>Requirements</h4>
                            <p id="modalEventRequirements"></p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="#" id="modalParticipateBtn" class="btn btn-primary">Participate in Event</a>
                        <button type="button" class="btn btn-secondary modal-close-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this._modal = modal;

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const closeBtnFooter = modal.querySelector('.modal-close-btn');
        const overlay = modal.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => this.closeEventModal());
        closeBtnFooter.addEventListener('click', () => this.closeEventModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeEventModal();
        });

        // Allow ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this._modal.getAttribute('aria-hidden')) {
                this.closeEventModal();
            }
        });
    }

    /**
     * Open event modal with event details
     */
    openEventModal(eventId) {
        const event = this.events.find(e => Number(e.id) === eventId);
        if (!event) return;

        // Format date
        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Populate modal
        document.getElementById('modalEventTitle').textContent = this.escapeHtml(event.title);
        document.getElementById('modalEventDate').textContent = formattedDate;
        document.getElementById('modalEventTime').textContent = event.time;
        document.getElementById('modalEventLocation').textContent = this.escapeHtml(event.location);
        document.getElementById('modalEventDescription').innerHTML = `<p>${this.escapeHtml(event.description)}</p>`;
        document.getElementById('modalEventRequirements').textContent = this.escapeHtml(event.requirements);

        // Set participate button link
        document.getElementById('modalParticipateBtn').href = `./participation.html?eventId=${eventId}`;

        // Show modal
        this._modal.setAttribute('aria-hidden', 'false');
        this._modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    /**
     * Close event modal
     */
    closeEventModal() {
        this._modal.setAttribute('aria-hidden', 'true');
        this._modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Load events from API or data file and render
     */
    async loadAndRender() {
        try {
            this.loadingState.style.display = 'block';

            // Try API first
            try {
                const response = await fetch('/api/events');
                if (response.ok) {
                    const text = await response.text();
                    this.events = text ? JSON.parse(text) : [];
                    this.render();
                    return;
                }
            } catch (e) {
                console.log('API failed, trying data file...');
            }

            // Fallback to data file
            const response = await fetch('./data/events.json');
            if (!response.ok) throw new Error('Failed to load events');
            const text = await response.text();
            this.events = text ? JSON.parse(text) : [];

            this.render();
        } catch (error) {
            console.error('Error loading events:', error);
            this.loadingState.style.display = 'none';
            this.emptyState.hidden = false;
        }
    }

    /**
     * Main render method
     */
    render() {
        this.loadingState.style.display = 'none';
        this.renderEvents();
        this.updateEventCount();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EventsManager();
});
