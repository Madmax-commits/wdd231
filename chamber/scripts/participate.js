/**
 * Event Participation Handler
 * Manages event details display and participation form submission
 */

class ParticipationManager {
    constructor() {
        this.currentEventId = null;
        this.event = null;
        this.form = document.getElementById('registerForm');
        this.messageDiv = document.getElementById('message');
        this.loading = document.getElementById('loading');
        this.eventDetails = document.getElementById('eventDetails');
        this.participationForm = document.getElementById('participationForm');
        this.paymentSection = document.getElementById('paymentSection');
        this.paymentRef = document.getElementById('paymentRef');

        this.initializeForm();
        this.loadEventDetails();
    }

    /**
     * Initialize form submission
     */
    initializeForm() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.submitParticipation(e));
        }
    }

    /**
     * Load event details from URL parameter and API/data file
     */
    async loadEventDetails() {
        try {
            // Get eventId from URL parameter
            const params = new URLSearchParams(window.location.search);
            this.currentEventId = Number(params.get('eventId'));

            if (!this.currentEventId) {
                this.showMessage('Event ID not provided', 'error');
                this.loading.style.display = 'none';
                return;
            }

            // Try to fetch from API first, fallback to JSON file
            let event = null;
            try {
                const response = await fetch(`/api/events/${this.currentEventId}`);
                if (response.ok) {
                    const text = await response.text();
                    event = text ? JSON.parse(text) : null;
                }
            } catch (e) {
                // API failed, try data file
                console.log('API failed, trying data file...');
            }

            // Fallback to data file
            if (!event) {
                const response = await fetch('./data/events.json');
                const text = await response.text();
                const events = text ? JSON.parse(text) : [];
                event = events.find(e => e.id === this.currentEventId);
            }

            if (!event) {
                this.showMessage('Event not found', 'error');
                this.loading.style.display = 'none';
                return;
            }

            this.event = event;
            this.displayEventDetails();
            this.setupPaymentSection();
            this.setupMandatoryFields();

        } catch (error) {
            console.error('Error loading event:', error);
            this.showMessage('Error loading event details', 'error');
            this.loading.style.display = 'none';
        }
    }

    /**
     * Display event details on page
     */
    displayEventDetails() {
        if (!this.event) return;

        // Format date
        const dateObj = new Date(this.event.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Populate event details
        document.getElementById('eventTitle').textContent = this.escapeHtml(this.event.title);
        document.getElementById('eventDate').textContent = formattedDate;
        document.getElementById('eventTime').textContent = this.event.time;
        document.getElementById('eventLocation').textContent = this.escapeHtml(this.event.location);
        document.getElementById('eventDescription').textContent = this.escapeHtml(this.event.description);
        document.getElementById('eventRequirements').textContent = this.escapeHtml(this.event.requirements);

        // Show event details and form, hide loading
        this.loading.style.display = 'none';
        this.eventDetails.style.display = 'block';
        this.participationForm.style.display = 'block';
    }

    /**
     * Setup payment section based on event payment requirements
     */
    setupPaymentSection() {
        if (!this.event) return;

        if (this.event.paymentRequired && this.event.cost) {
            this.paymentSection.classList.remove('hidden');
            document.getElementById('eventCost').textContent = `£${this.event.cost.toFixed(2)}`;
            this.paymentRef.setAttribute('required', 'required');
        } else {
            this.paymentSection.classList.add('hidden');
            this.paymentRef.removeAttribute('required');
        }
    }

    /**
     * Setup mandatory fields based on event requirements
     */
    setupMandatoryFields() {
        if (!this.event) return;

        const mandatoryFields = this.event.mandatoryFields || [];
        if (mandatoryFields.length === 0) return;

        const form = this.form;
        
        // Field configurations
        const fieldConfigs = {
            phone: {
                id: 'mandatoryPhone',
                label: 'Phone Number *',
                type: 'tel',
                placeholder: 'Enter your phone number',
                name: 'phone'
            },
            company: {
                id: 'mandatoryCompany',
                label: 'Company/Organization *',
                type: 'text',
                placeholder: 'Enter your company name',
                name: 'company'
            },
            role: {
                id: 'mandatoryRole',
                label: 'Job Title/Role *',
                type: 'text',
                placeholder: 'Enter your job title',
                name: 'role'
            },
            industry: {
                id: 'mandatoryIndustry',
                label: 'Industry *',
                type: 'text',
                placeholder: 'Enter your industry',
                name: 'industry'
            },
            experience: {
                id: 'mandatoryExperience',
                label: 'Experience Level *',
                type: 'select',
                options: ['Entry Level', 'Mid-Level', 'Senior', 'Executive'],
                name: 'experience'
            },
            goals: {
                id: 'mandatoryGoals',
                label: 'What are your goals for this event? *',
                type: 'textarea',
                placeholder: 'Tell us what you hope to achieve...',
                name: 'goals'
            }
        };

        // Find insertion point (before additional info)
        const additionalInfoGroup = form.querySelector('label[for="additionalInfo"]')?.parentElement;
        
        // Add mandatory fields
        mandatoryFields.forEach(fieldName => {
            const config = fieldConfigs[fieldName];
            if (!config) return;

            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';

            const label = document.createElement('label');
            label.setAttribute('for', config.id);
            label.textContent = config.label;

            let input;
            if (config.type === 'textarea') {
                input = document.createElement('textarea');
                input.placeholder = config.placeholder;
            } else if (config.type === 'select') {
                input = document.createElement('select');
                config.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.textContent = option;
                    input.appendChild(opt);
                });
            } else {
                input = document.createElement('input');
                input.type = config.type;
                input.placeholder = config.placeholder;
            }

            input.id = config.id;
            input.name = config.name;
            input.required = true;

            fieldGroup.appendChild(label);
            fieldGroup.appendChild(input);

            // Insert before additional info group
            if (additionalInfoGroup) {
                additionalInfoGroup.parentElement.insertBefore(fieldGroup, additionalInfoGroup);
            } else {
                form.appendChild(fieldGroup);
            }
        });
    }

    /**
     * Handle participation form submission
     */
    async submitParticipation(e) {
        e.preventDefault();

        if (!this.currentEventId) {
            this.showMessage('Error: Event ID not found', 'error');
            return;
        }

        try {
            // Collect form data
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                contact: formData.get('contact'),
                additionalInfo: formData.get('additionalInfo') || '',
                eventId: this.currentEventId
            };

            // Add payment reference if event requires payment
            if (this.event.paymentRequired) {
                data.paymentRef = formData.get('paymentRef');
            }

            // Add mandatory fields
            const mandatoryFields = this.event.mandatoryFields || [];
            mandatoryFields.forEach(fieldName => {
                if (fieldName === 'phone') data.phone = formData.get('phone');
                if (fieldName === 'company') data.company = formData.get('company');
                if (fieldName === 'role') data.role = formData.get('role');
                if (fieldName === 'industry') data.industry = formData.get('industry');
                if (fieldName === 'experience') data.experience = formData.get('experience');
                if (fieldName === 'goals') data.goals = formData.get('goals');
            });

            // Submit participation
            const response = await fetch(`/api/events/${this.currentEventId}/participate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);
            const text = await response.text();
            console.log('Response text:', text);
            
            let result = null;
            try {
                result = text ? JSON.parse(text) : { ok: false };
                console.log('Parsed result:', result);
            } catch (e) {
                console.error('JSON parse error:', e);
                result = { ok: false, error: 'Server error' };
            }

            if (result.ok) {
                console.log('✓ Registration successful!');
                this.showSuccessPopup();
                this.form.reset();
                // Redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 3000);
            } else {
                console.error('Registration failed:', result.error);
                this.showMessage(`Error: ${result.error || 'Failed to register for event'}`, 'error');
            }

        } catch (error) {
            console.error('Submission error:', error);
            this.showMessage('Error submitting participation form', 'error');
        }
    }

    /**
     * Show success popup
     */
    showSuccessPopup() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;

        // Create modal content
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: scaleUp 0.3s ease;
        `;

        // Add checkmark icon
        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            color: white;
            animation: popIn 0.5s ease 0.2s backwards;
        `;
        icon.textContent = '✓';

        // Add title
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #155724;
            margin: 0 0 0.75rem 0;
            font-size: 1.5rem;
        `;
        title.textContent = 'Registration Successful!';

        // Add message
        const message = document.createElement('p');
        message.style.cssText = `
            color: #666;
            margin: 0 0 1.5rem 0;
            font-size: 1rem;
            line-height: 1.5;
        `;
        message.textContent = 'Thank you for registering! We\'ll contact you soon with more details about the event.';

        // Add redirecting text
        const redirectText = document.createElement('p');
        redirectText.style.cssText = `
            color: #999;
            margin: 0;
            font-size: 0.9rem;
        `;
        redirectText.textContent = 'Redirecting you to the home page...';

        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(redirectText);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleUp {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes popIn {
                from { transform: scale(0); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show message to user
     */
    showMessage(text, type) {
        this.messageDiv.textContent = text;
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.style.display = 'block';

        // Auto-hide error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                this.messageDiv.style.display = 'none';
            }, 5000);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ParticipationManager();
});
