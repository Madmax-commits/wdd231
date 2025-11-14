const apiKey = "5fa35aef0fdf4b2467fba30a5c65e431";
const city = "Asaba,NG";
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

async function getWeather() {
  try {
    // Current weather
    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    
    const data = await res.json();
    const weatherEl = document.getElementById("current-weather");
    if (weatherEl) {
      weatherEl.innerHTML = `
        <h3>${data.name}</h3>
        <div class="temp">${Math.round(data.main.temp)}°C</div>
        <div class="desc">${data.weather[0].description}</div>
        <div class="feels">Feels like: ${Math.round(data.main.feels_like)}°C</div>
      `;
    }

    // Forecast (next 3 days at noon)
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);
    
    const forecastData = await forecastRes.json();
    const forecastEl = document.getElementById("forecast");
    if (forecastEl) {
      forecastEl.innerHTML = "<h3>3-Day Forecast</h3>";
      const filtered = forecastData.list
        .filter(f => f.dt_txt.includes("12:00:00"))
        .slice(0, 3);
      
      filtered.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString("en-US", { 
          weekday: "short", 
          month: "short", 
          day: "numeric" 
        });
        forecastEl.innerHTML += `
          <div class="forecast-day">
            <p><strong>${date}</strong></p>
            <p>${Math.round(day.main.temp)}°C</p>
            <p>${day.weather[0].description}</p>
          </div>
        `;
      });
    }
  } catch (err) {
    console.error("Weather fetch error:", err);
    const weatherEl = document.getElementById("current-weather");
    if (weatherEl) {
      weatherEl.innerHTML = `<p style="color:red;">Unable to load weather data.</p>`;
    }
  }
}

// Run on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", getWeather);
} else {
  getWeather();
}

