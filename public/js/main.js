let map;
let timeInterval;

async function getWeather(lat, lon, city, saveData = false) {
  try {
    clearInterval(timeInterval);

    const response = await fetch(`/weather?lat=${lat}&lon=${lon}`);
    const weatherData = await response.json();

    const temperatureCelsius = (weatherData.main.temp - 273.15).toFixed(2);
    const feelsLikeCelsius = (weatherData.main.feels_like - 273.15).toFixed(2);

    const timestamp = weatherData.dt;
    const timezoneResponse = await fetch(
      `/timezone?lat=${lat}&lon=${lon}&timestamp=${timestamp}`
    );
    const timezoneData = await timezoneResponse.json();

    const timezone = timezoneData.zoneName;

    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timezone,
    });

    // First, save to user data, then display from the user

    const weatherInfo = document.getElementById("weather-info");
    weatherInfo.innerHTML = `
      <div class="weather-card">
        <p>City: ${weatherData.name}</p>
        <p>Temperature: ${temperatureCelsius}°C</p>
        <p>Description: ${weatherData.weather[0].description}</p>
        <img src="http://openweathermap.org/img/wn/${
          weatherData.weather[0].icon
        }.png" alt="Weather Icon">
        <p>Coordinates: ${weatherData.coord.lat}, ${weatherData.coord.lon}</p>
        <p>Feels Like: ${feelsLikeCelsius}°C</p>
        <p>Humidity: ${weatherData.main.humidity}%</p>
        <p>Pressure: ${weatherData.main.pressure} hPa</p>
        <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
        <p>Country Code: ${weatherData.sys.country}</p>
        <p>Rain Volume (last 3 hours): ${
          weatherData.rain ? weatherData.rain["1h"] : 0
        } mm</p>
        <p>Air Quality Index: ${weatherData.airQualityIndex || "N/A"}</p>
        <p>Date: ${formattedDate}</p>
        <p id="current-time"></p>
        <p>Timezone: ${timezone}</p>
      </div>
    `;

    showMap(
      "map",
      weatherData.coord.lat,
      weatherData.coord.lon,
      weatherData.name,
      timezone
    );

    const prompt =
      weatherData.weather[0].description +
      " in " +
      weatherData.name +
      " city " +
      weatherData.sys.country;

    changeBackgroundImage(prompt, timezone);

    const currentTimeElement = document.getElementById("current-time");
    timeInterval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: timezone,
        hour12: true,
      });
      currentTimeElement.textContent = `Current Time: ${currentTime}`;
    }, 1000);

    if (saveData) {
      const username = getUsernameFromUrl();
      const weatherDataToSave = {
        city: city,
        latitude: lat,
        longitude: lon,
        weather: weatherData,
        timestamp: new Date().toISOString(),
      };
      await saveWeatherDataToUser(username, weatherDataToSave);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}


async function saveWeatherDataToUser(username, weatherData) {
  try {
    const response = await fetch(`/users/${username}/weather`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(weatherData),
    });
    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error("Error saving weather data to user:", error);
  }
}

function getUsernameFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('username');
}

async function getTimezone(lat, lon, timestamp) {
  try {
    const response = await fetch(
      `/timezone?lat=${lat}&lon=${lon}&timestamp=${timestamp}`
    );
    const timezoneData = await response.json();

    console.log("Timezone Data:", timezoneData);
  } catch (error) {
    console.error("Error fetching timezone data:", error);
  }
}

async function getWeatherByCity() {
  const city = document.getElementById("city").value;

  const geoCodingResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?city=${city}&format=json`
  );
  const geoCodingData = await geoCodingResponse.json();

  if (geoCodingData.length > 0) {
    const lat = geoCodingData[0].lat;
    const lon = geoCodingData[0].lon;
    getWeather(lat, lon, city, true);
  } else {
    alert(`Could not find city named ${city}.`);
  }
}

async function getWeatherByCoordinates() {
  const latInput = document.getElementById("lat");
  const lonInput = document.getElementById("lon");

  const lat = latInput.value;
  const lon = lonInput.value;

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    alert(
      "Please enter valid coordinates within the range:\nLatitude (-90 to 90)\nLongitude (-180 to 180)"
    );
    return;
  }

  const geoCodingResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  );
  const geoCodingData = await geoCodingResponse.json();

  if (!geoCodingData.address || !geoCodingData.address.city) {
    alert("No city found for the entered coordinates.");
    return;
  }

  const city = geoCodingData.address.city;
  getWeather(lat, lon, city, true);
}

async function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeather(lat, lon, null, true);
    });
  } else {
    alert("Geolocation is not supported by your browser");
  }
}

function showMap(containerId, lat, lon, cityName) {
  if (!map) {
    map = L.map(containerId).setView([lat, lon], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Talgatov Aibyn",
    }).addTo(map);
  }

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  L.marker([lat, lon]).addTo(map).bindPopup(`<b>${cityName}</b>`).openPopup();
}

function selectCityOnMap() {
  alert("Click on the map to select a city.");

  map.on("click", function (e) {
    const selectedCityLat = e.latlng.lat;
    const selectedCityLon = e.latlng.lng;
    getWeather(selectedCityLat, selectedCityLon, null, true);
    map.off("click");
  });
}

function changeBackgroundImage(description) {
  fetch(`/background?description=${encodeURIComponent(description)}`)
    .then((response) => response.json())
    .then((data) => {
      const backgroundImageUrl = data.urls.regular;
      document.body.style.backgroundImage = `url(${backgroundImageUrl})`;
    })
    .catch((error) => {
      console.error("Error fetching background image:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("username");

  if (username) {
    const usernameElement = document.getElementById("username");
    usernameElement.textContent = `Welcome, ${username}!`;
  }

  const exitButton = document.getElementById("exit-button");
  exitButton.addEventListener("click", function () {
    window.location.href = "index.html";
  });
});
