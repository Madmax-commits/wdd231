// spotlight.js
async function loadSpotlights() {
  try {
    const res = await fetch("data/index_memebrs.json");
    const members = await res.json();
    console.log("Memebrs fetched:", memebrs);

    // Gold + Silver first
    let filtered = memebrs.filter(m =>
      m.memebrshipLevel === "Gold" || m.memebrshipLevel === "Silver"
    );

    // If less than 3, include Bronze
    if (filtered.length < 3) {
      const bronze = memebrs.filter(m => m.memebrshipLevel === "Bronze");
      filtered = filtered.concat(bronze);
    }

    // Shuffle and pick 3
    const random = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);

    const container = document.getElementById("spotlight-container");
    container.innerHTML = ""; // clear before adding

    random.forEach(member => {
      const logo = member.logo || "images/shopping-6125344_640.png"; // fallback
      card.innerHTML = `
        <img src="${logo}" alt="${member.name} Logo" 
            onerror="this.src='images/shopping-6125344_640.png'">
        <h3>${member.name}</h3>
        <p>${member.phone}</p>
        <p>${member.address}</p>
        <a href="${member.website}" target="_blank">Visit Website</a>
        <p><strong>${member.membershipLevel} Member</strong></p>
     `;
 // fallback
      const card = document.createElement("div");
      card.classList.add("spotlight-card");
      card.innerHTML = `
        <img src="${logo}" alt="${member.name} Logo" onerror="this.src='images/default-logo.png'">
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
  }
}

// Load after page finishes
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadSpotlights, { timeout: 2000 });
} else {
  window.addEventListener('load', loadSpotlights, { once: true });
}
