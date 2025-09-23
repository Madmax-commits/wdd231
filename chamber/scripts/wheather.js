const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";
const city = "Lagos,NG"; // Change to your chamber's location
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

async function getWeather() {
  try {
    // Current weather
    const res = await fetch(weatherUrl);
    const data = await res.json();
    document.getElementById("current-weather").innerHTML = `
      <p>Temperature: ${data.main.temp}°C</p>
      <p>${data.weather[0].description}</p>
    `;

    // Forecast (next 3 days at noon)
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();
    const forecastEl = document.getElementById("forecast");
    forecastEl.innerHTML = "<h3>3-Day Forecast</h3>";
    const filtered = forecastData.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 3);
    filtered.forEach(day => {
      const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "long" });
      forecastEl.innerHTML += `
        <p>${date}: ${day.main.temp}°C, ${day.weather[0].description}</p>
      `;
    });
  } catch (err) {
    console.error("Weather fetch error:", err);
  }
}

getWeather();

