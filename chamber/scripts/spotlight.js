// spotlight.js
// Inject CSS for spotlight cards styled to match the site theme + gold/silver effects + animations
const style = document.createElement("style");
style.textContent = `
  /* Responsive Grid */
  #spotlight-container {
    display: grid;
    gap: 1.5rem;
    padding: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  /* Spotlight Card Base */
  .spotlight-card {
    background: var(--glass, rgba(255,255,255,0.6));
    backdrop-filter: blur(12px);
    border-radius: 18px;
    padding: 1.25rem;
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(255,255,255,0.45);
    transition: transform .25s ease, box-shadow .25s ease, border .25s ease;
    overflow: hidden;
    position: relative;
  }

  .spotlight-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.14);
  }

  /* GOLD GLOW EFFECT */
  .gold-member {
    border: 1px solid rgba(255, 179, 0, 0.6);
    box-shadow: 0 0 14px rgba(255, 179, 0, 0.55);
  }

  .gold-member:hover {
    box-shadow: 0 0 22px rgba(255, 179, 0, 0.75);
  }

  /* SILVER SHINE EFFECT */
  .silver-member {
    border: 1px solid rgba(180, 180, 180, 0.55);
    box-shadow: 0 0 12px rgba(220, 220, 220, 0.6);
  }

  .silver-member:hover {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.85);
  }

  /* Animated Logo Reveal */
  .logo img {
    height: 44px;
    width: auto;
    border-radius: 8px;
    opacity: 0;
    transform: scale(0.85);
    animation: logoPop .6s ease forwards;
  }

  /* Logo Animation Keyframes */
  @keyframes logoPop {
    0% { opacity: 0; transform: scale(0.85); }
    60% { opacity: 1; transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }

  /* Logo Row */
  .logo {
    display: flex;
    align-items: center;
    gap: .75rem;
    margin-bottom: .75rem;
  }

  .brand {
    font-weight: 700;
    color: var(--text, #0f1724);
    letter-spacing: .2px;
    font-size: 1.05rem;
  }

  .spotlight-card p {
    margin: .3rem 0;
    color: var(--muted, #6b7280);
    font-size: .9rem;
  }

  /* Visit website button */
  .spotlight-card a {
    display: inline-block;
    margin-top: .6rem;
    padding: .45rem .9rem;
    background: var(--primary, #004d40);
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-size: .9rem;
    transition: background .25s ease;
  }

  .spotlight-card a:hover {
    background: var(--accent, #ffb300);
    color: #0f1724;
  }

  .spotlight-card strong {
    color: var(--primary, #004d40);
  }
`;
document.head.appendChild(style);

// Spotlight Loader Script
async function loadSpotlights() {
  try {
    const res = await fetch("data/index_memebrs.json");
    if (!res.ok) throw new Error("Failed to fetch members JSON");
    const members = await res.json();

    // Filter Gold + Silver
    let filtered = members.filter(
      m => m.membershipLevel === "Gold" || m.membershipLevel === "Silver"
    );

    // Shuffle + pick 3
    const random = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);

    const container = document.getElementById("spotlight-container");
    container.innerHTML = "";

    random.forEach(member => {
      const logo = member.logo || "images/shopping-6125344_640.png";

      const card = document.createElement("div");
      card.classList.add("spotlight-card");

      // Apply gold or silver shine
      if (member.membershipLevel === "Gold") {
        card.classList.add("gold-member");
      } else if (member.membershipLevel === "Silver") {
        card.classList.add("silver-member");
      }

      card.innerHTML = `
        <div class="logo">
          <img src="${logo}" alt="${member.name} Logo" 
               onerror="this.src='images/shopping-6125344_640.png'">
          <span class="brand">${member.name}</span>
        </div>

        <p>${member.phone}</p>
        <p>${member.address}</p>
        <a href="${member.website}" target="_blank">Visit Website</a>
        <p><strong>${member.membershipLevel} Member</strong></p>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Spotlight error:", err);
    document.getElementById("spotlight-container").innerHTML =
      "<p>Unable to load Featured Businesses.</p>";
  }
}

window.addEventListener('load', loadSpotlights);
