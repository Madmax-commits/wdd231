const apiKey = "5fa35aef0fdf4b2467fba30a5c65e431";
const city = "Asaba,NG";
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

/**
 * Safely escape HTML entities to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Fetch and display current weather
 */
async function getWeather() {
  try {
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status} ${weatherRes.statusText}`);
    }

    const data = await weatherRes.json();
    const weatherEl = document.getElementById("current-weather");
    
    if (weatherEl) {
      const temp = Math.round(data.main.temp);
      const feels = Math.round(data.main.feels_like);
      const description = escapeHtml(data.weather[0].description);
      const cityName = escapeHtml(data.name);
      
      weatherEl.innerHTML = `
        <h3>${cityName}</h3>
        <div class="temp">${temp}°C</div>
        <div class="desc">${description}</div>
        <div class="feels">Feels like: ${feels}°C</div>
      `;
    }

    // Fetch 3-day forecast
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) {
      throw new Error(`Forecast API error: ${forecastRes.status}`);
    }

    const forecastData = await forecastRes.json();
    const forecastEl = document.getElementById("forecast");
    
    if (forecastEl) {
      const filtered = forecastData.list
        .filter(f => f.dt_txt.includes("12:00:00"))
        .slice(0, 3);

      let forecastHtml = "<h3>3-Day Forecast</h3>";
      filtered.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric"
        });
        const temp = Math.round(day.main.temp);
        const desc = escapeHtml(day.weather[0].description);
        
        forecastHtml += `
          <div class="forecast-day">
            <p><strong>${date}</strong></p>
            <p>${temp}°C</p>
            <p>${desc}</p>
          </div>
        `;
      });
      
      forecastEl.innerHTML = forecastHtml;
    }
  } catch (err) {
    console.error("Weather fetch error:", err);
    const weatherEl = document.getElementById("current-weather");
    if (weatherEl) {
      weatherEl.innerHTML = `<p style="color: #d32f2f; padding: 1rem;">Unable to load weather data. Please try again later.</p>`;
      weatherEl.setAttribute('role', 'alert');
    }
  }
}

/**
 * Schedule weather load using requestIdleCallback with fallback
 */
function scheduleWeatherLoad() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(getWeather, { timeout: 3000 });
  } else {
    // Fallback: Load after page is fully loaded
    window.addEventListener('load', getWeather, { once: true });
  }
}

// Execute when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scheduleWeatherLoad);
} else {
  scheduleWeatherLoad();
}
