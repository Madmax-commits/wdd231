async function loadSpotlights() {
  try {
    const res = await fetch("data/index_memebrs.json");
    const members = await res.json();

    // Filter Gold/Silver
    const filtered = members.filter(m => m.membershipLevel === "Gold" || m.membershipLevel === "Silver");

    // Shuffle and pick 2–3
    const random = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);

    const container = document.getElementById("spotlight-container");
    random.forEach(member => {
      const card = document.createElement("div");
      card.classList.add("spotlight-card");
      card.innerHTML = `
        <img src="${member.logo}" alt="${member.name} Logo">
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

loadSpotlights();

