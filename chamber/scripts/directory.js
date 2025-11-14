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

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('#navMenu ul');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('show');
      hamburger.textContent = navMenu.classList.contains('show') ? '✖' : '☰';
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && e.target !== hamburger) {
        navMenu.classList.remove('show');
        hamburger.textContent = '☰';
      }
    });

    document.addEventListener('keydown', () => {
      if (navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        hamburger.textContent = '☰';
      }
    });
  }

  // Members section
  const membersContainer = document.getElementById('members');
  const gridBtn = document.getElementById('gridView');
  const listBtn = document.getElementById('listView');

  if (membersContainer) {
    async function loadMembers() {
      try {
        const response = await fetch('data/members.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const members = await response.json();
        membersContainer.innerHTML = '';

        members.forEach(member => {
          const card = document.createElement('div');
          card.classList.add('member-card');

          card.innerHTML = `
            <img src="images/${member.image}" alt="${member.name}" />
            <div class="member-info">
              <h3>${member.name}</h3>
              <p>${member.description}</p>
              <p><strong>Address:</strong> ${member.address}</p>
              <p><strong>Phone:</strong> ${member.phone}</p>
              <p><strong>Website:</strong> <a href="${member.website}" target="_blank">${member.website}</a></p>
              <p><strong>Membership:</strong> ${getMembershipLevel(member.membership)}</p>
            </div>
          `;

          membersContainer.appendChild(card);
        });
      } catch (err) {
        console.error('Error loading members:', err);
        membersContainer.innerHTML = '<p style="color:red;">Unable to load members. Please try again later.</p>';
      }
    }

    function getMembershipLevel(level) {
      return level === 3 ? 'Gold' : level === 2 ? 'Silver' : 'Member';
    }

    if (gridBtn) {
      gridBtn.addEventListener('click', () => {
        membersContainer.classList.add('grid');
        membersContainer.classList.remove('list');
      });
    }

    if (listBtn) {
      listBtn.addEventListener('click', () => {
        membersContainer.classList.add('list');
        membersContainer.classList.remove('grid');
      });
    }

    loadMembers();
  }
});

