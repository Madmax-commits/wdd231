// spotlight.js
async function loadSpotlights() {
  try {
    const res = await fetch("data/index_members.json");
    if (!res.ok) throw new Error("Failed to fetch members JSON");
    const members = await res.json();

    // Filter Gold/Silver
    let filtered = members.filter(m =>
      m.membershipLevel === "Gold" || m.membershipLevel === "Silver"
    );

    // Shuffle and pick max 3
    const random = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);

    const container = document.getElementById("spotlight-container");
    container.innerHTML = ""; // clear previous cards

    random.forEach(member => {
      const logo = member.logo || "images/default-logo.png";
      const card = document.createElement("div");
      card.classList.add("spotlight-card");
      card.innerHTML = `
        <img src="${logo}" alt="${member.name} Logo" 
             onerror="this.src='images/default-logo.png'">
        <h3>${member.name}</h3>
        <p>${member.phone}</p>
        <p>${member.address}</p>
        <a href="${member.website}" target="_blank">Visit Website</a>
        <p><strong>${member.membershipLevel} Member</strong></p>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Spotlight error:", err);
    document.getElementById("spotlight-container").innerHTML = "<p>Unable to load Featured Businesses.</p>";
  }
}

// Run after page load
window.addEventListener('load', loadSpotlights);
