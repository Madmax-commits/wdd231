/**
 * Admin Event Management Handler
 * Handles creating, updating, and deleting events
 */

class AdminEventManager {
    constructor() {
        this.adminToken = localStorage.getItem('adminToken') || '';
        this.form = document.getElementById('eventForm');
        this.messageDiv = document.getElementById('message');
        this.eventsList = document.getElementById('eventsList');
        this.paymentRequired = document.getElementById('paymentRequired');
        this.costGroup = document.getElementById('costGroup');
        this.events = [];

        this.initializeForm();
        this.loadEvents();
        this.attachEventListeners();

        // Restore token if exists
        if (this.adminToken) {
            document.getElementById('adminToken').value = this.adminToken;
        }
    }

    /**
     * Initialize form submission and payment toggle
     */
    initializeForm() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.submitEvent(e));
        }

        // Toggle cost field based on payment required
        this.paymentRequired.addEventListener('change', (e) => {
            this.costGroup.style.display = e.target.value === 'true' ? 'block' : 'none';
            if (e.target.value === 'false') {
                document.getElementById('cost').value = '';
            }
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-edit')) {
                this.editEvent(Number(e.target.getAttribute('data-id')));
            }
            if (e.target.classList.contains('btn-delete')) {
                if (confirm('Are you sure you want to delete this event?')) {
                    this.deleteEvent(Number(e.target.getAttribute('data-id')));
                }
            }
        });
    }

    /**
     * Load events from API
     */
    async loadEvents() {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Failed to load events');
            
            const text = await response.text();
            this.events = text ? JSON.parse(text) : [];
            this.renderEventsList();
        } catch (error) {
            console.error('Error loading events:', error);
            this.eventsList.innerHTML = '<div class="empty-state"><p>Failed to load events. Make sure the server is running.</p></div>';
        }
    }

    /**
     * Render events list
     */
    renderEventsList() {
        if (this.events.length === 0) {
            this.eventsList.innerHTML = '<div class="empty-state"><p>No events yet. Create one to get started!</p></div>';
            return;
        }

        this.eventsList.innerHTML = this.events.map(event => {
            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const mandatoryFields = event.mandatoryFields || [];
            const mandatoryDisplay = mandatoryFields.length > 0 
                ? mandatoryFields.map(f => `<span class="badge">${this.formatFieldName(f)}</span>`).join('')
                : '<span style="color: #999; font-size: 0.9rem;">None</span>';

            return `
                <div class="event-item">
                    <div class="event-item-content">
                        <h4>${this.escapeHtml(event.title)}</h4>
                        <div class="event-item-meta">
                            <span><strong>📅 Date:</strong> ${formattedDate}</span>
                            <span><strong>⏰ Time:</strong> ${event.time}</span>
                            <span><strong>📍 Location:</strong> ${this.escapeHtml(event.location)}</span>
                            ${event.paymentRequired ? `<span><strong>💷 Cost:</strong> £${event.cost.toFixed(2)}</span>` : '<span><strong>💷 Cost:</strong> Free</span>'}
                        </div>
                        <div style="margin-top: 1rem;">
                            <strong style="color: var(--primary-color); font-size: 0.9rem;">Mandatory Information:</strong>
                            <div class="mandatory-fields-display">
                                ${mandatoryDisplay}
                            </div>
                        </div>
                    </div>
                    <div class="event-item-actions">
                        <button class="btn btn-edit btn-secondary" data-id="${event.id}">Edit</button>
                        <button class="btn btn-delete btn-danger" data-id="${event.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Format field name for display
     */
    formatFieldName(field) {
        const names = {
            phone: 'Phone',
            company: 'Company',
            role: 'Job Title',
            industry: 'Industry',
            experience: 'Experience',
            goals: 'Event Goals'
        };
        return names[field] || field;
    }

    /**
     * Get selected mandatory fields
     */
    getMandatoryFields() {
        return Array.from(document.querySelectorAll('input[name="mandatoryFields"]:checked'))
            .map(checkbox => checkbox.value);
    }

    /**
     * Submit event creation
     */
    async submitEvent(e) {
        e.preventDefault();

        if (!this.adminToken) {
            this.showMessage('Please enter admin token first', 'error');
            return;
        }

        try {
            const event = {
                title: document.getElementById('eventTitle').value.trim(),
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                location: document.getElementById('eventLocation').value.trim(),
                description: document.getElementById('eventDescription').value.trim(),
                requirements: document.getElementById('eventRequirements').value.trim(),
                posterEmail: document.getElementById('posterEmail').value.trim(),
                paymentRequired: document.getElementById('paymentRequired').value === 'true',
                cost: document.getElementById('paymentRequired').value === 'true' 
                    ? parseFloat(document.getElementById('cost').value) || 0 
                    : null,
                mandatoryFields: this.getMandatoryFields(),
                postedAt: new Date().toISOString()
            };

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.adminToken}`
                },
                body: JSON.stringify(event)
            });

            const text = await response.text();
            const result = text ? JSON.parse(text) : { ok: false };

            if (response.ok) {
                this.showMessage('✓ Event created successfully!', 'success');
                this.form.reset();
                this.costGroup.style.display = 'none';
                this.loadEvents();
            } else {
                this.showMessage(`Error: ${result.error || 'Failed to create event'}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting event:', error);
            this.showMessage('Error creating event', 'error');
        }
    }

    /**
     * Edit event (loads into form)
     */
    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventRequirements').value = event.requirements;
        document.getElementById('posterEmail').value = event.posterEmail;
        document.getElementById('paymentRequired').value = event.paymentRequired ? 'true' : 'false';
        
        if (event.paymentRequired) {
            document.getElementById('cost').value = event.cost;
            this.costGroup.style.display = 'block';
        } else {
            this.costGroup.style.display = 'none';
        }

        // Check mandatory fields
        const mandatoryFields = event.mandatoryFields || [];
        document.querySelectorAll('input[name="mandatoryFields"]').forEach(checkbox => {
            checkbox.checked = mandatoryFields.includes(checkbox.value);
        });

        // Scroll to form
        document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
        
        this.showMessage('Edit the event details and save', 'info');
    }

    /**
     * Delete event
     */
    async deleteEvent(eventId) {
        if (!this.adminToken) {
            this.showMessage('Please enter admin token first', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`
                }
            });

            const text = await response.text();
            const result = text ? JSON.parse(text) : { ok: false };

            if (response.ok) {
                this.showMessage('✓ Event deleted successfully!', 'success');
                this.loadEvents();
            } else {
                this.showMessage(`Error: ${result.error || 'Failed to delete event'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            this.showMessage('Error deleting event', 'error');
        }
    }

    /**
     * Show message to user
     */
    showMessage(text, type) {
        this.messageDiv.textContent = text;
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.style.display = 'block';

        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                this.messageDiv.style.display = 'none';
            }, 4000);
        }
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
}

/**
 * Global function to save token
 */
function saveToken() {
    const token = document.getElementById('adminToken').value.trim();
    if (!token) {
        alert('Please enter a token');
        return;
    }
    localStorage.setItem('adminToken', token);
    alert('Token saved to browser');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AdminEventManager();
});
