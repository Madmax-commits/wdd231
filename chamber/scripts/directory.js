document.getElementById('year').textContent = new Date().getFullYear();
 document.getElementById('lastModified').textContent = document.lastModified;

 const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('#navMenu ul');

  // Toggle menu open/close
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from bubbling
    navMenu.classList.toggle('show');
    hamburger.textContent = navMenu.classList.contains('show') ? '✖' : '☰';
  });

  // Close menu when clicking or typing anywhere else
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

  const membersContainer = document.getElementById('members');
const gridBtn = document.getElementById('gridView');
const listBtn = document.getElementById('listView');

async function loadMembers() {
  const response = await fetch('data/members.json');
  const members = await response.json();

  membersContainer.innerHTML = ''; // Clear previous content

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
}

function getMembershipLevel(level) {
  return level === 3 ? 'Gold' : level === 2 ? 'Silver' : 'Member';
}

// Toggle view
gridBtn.addEventListener('click', () => {
  membersContainer.classList.add('grid');
  membersContainer.classList.remove('list');
});

listBtn.addEventListener('click', () => {
  membersContainer.classList.add('list');
  membersContainer.classList.remove('grid');
});

loadMembers();

