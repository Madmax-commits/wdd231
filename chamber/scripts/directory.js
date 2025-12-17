// Update year and last modified
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  const lastModEl = document.getElementById('lastModified');
  
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  
  if (lastModEl) {
    lastModEl.textContent = new Date(document.lastModified).toLocaleString();
  }

  // Hamburger menu with proper accessibility
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('#navMenu ul');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('show');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.textContent = isOpen ? '✖' : '☰';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && e.target !== hamburger) {
        navMenu.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
        hamburger.focus();
      }
    });
  }

  // Members section with safe rendering
  const membersContainer = document.getElementById('members');
  const gridBtn = document.getElementById('gridView');
  const listBtn = document.getElementById('listView');

  if (membersContainer) {
    /**
     * Safely escape HTML to prevent XSS
     */
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Load members from JSON file
     */
    async function loadMembers() {
      try {
        const response = await fetch('data/members.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Unable to load member data`);
        }
        
        const members = await response.json();
        if (!Array.isArray(members)) {
          throw new Error('Invalid member data format');
        }

        membersContainer.innerHTML = '';
        membersContainer.setAttribute('role', 'list');

        members.forEach((member, index) => {
          const card = document.createElement('div');
          card.classList.add('member-card');
          card.setAttribute('role', 'listitem');

          const img = document.createElement('img');
          img.src = `images/${escapeHtml(member.image)}`;
          img.alt = escapeHtml(member.name);
          img.width = 120;
          img.height = 120;
          img.loading = 'lazy';
          img.decoding = 'async';

          const info = document.createElement('div');
          info.classList.add('member-info');
          
          const name = document.createElement('h3');
          name.textContent = member.name;
          
          const description = document.createElement('p');
          description.textContent = member.description;
          
          const address = document.createElement('p');
          address.innerHTML = `<strong>Address:</strong> ${escapeHtml(member.address)}`;
          
          const phone = document.createElement('p');
          const phoneLink = document.createElement('a');
          phoneLink.href = `tel:${escapeHtml(member.phone)}`;
          phoneLink.textContent = member.phone;
          phone.innerHTML = '<strong>Phone:</strong> ';
          phone.appendChild(phoneLink);
          
          const website = document.createElement('p');
          const websiteLink = document.createElement('a');
          websiteLink.href = escapeHtml(member.website);
          websiteLink.textContent = member.website;
          websiteLink.target = '_blank';
          websiteLink.rel = 'noopener noreferrer';
          website.innerHTML = '<strong>Website:</strong> ';
          website.appendChild(websiteLink);
          
          const membership = document.createElement('p');
          membership.innerHTML = `<strong>Membership:</strong> ${getMembershipLevel(member.membership)}`;

          info.append(name, description, address, phone, website, membership);
          card.append(img, info);
          membersContainer.appendChild(card);
        });
      } catch (err) {
        console.error('Error loading members:', err);
        membersContainer.innerHTML = '<p style="color: #d32f2f; grid-column: 1 / -1; text-align: center; padding: 2rem;">Unable to load member directory. Please try again later.</p>';
        membersContainer.setAttribute('role', 'alert');
      }
    }

    /**
     * Get membership level label
     */
    function getMembershipLevel(level) {
      const levels = { 3: 'Gold', 2: 'Silver', 1: 'Bronze' };
      return levels[level] || 'Member';
    }

    /**
     * Toggle view modes with accessibility
     */
    if (gridBtn && listBtn) {
      gridBtn.addEventListener('click', () => {
        membersContainer.classList.add('grid');
        membersContainer.classList.remove('list');
        gridBtn.setAttribute('aria-pressed', 'true');
        listBtn.setAttribute('aria-pressed', 'false');
      });

      listBtn.addEventListener('click', () => {
        membersContainer.classList.add('list');
        membersContainer.classList.remove('grid');
        listBtn.setAttribute('aria-pressed', 'true');
        gridBtn.setAttribute('aria-pressed', 'false');
      });
    }

    loadMembers();
  }
});

