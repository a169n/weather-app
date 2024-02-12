let map;
let timeInterval;

async function getWeather(lat, lon, city) {
  clearInterval(timeInterval);
  const userId = getUserIdFromUrl();

  try {
    const weatherResponse = await fetch("/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lat, lon, userId }),
    });
    const weatherData = await weatherResponse.json();
    const userWeatherResponse = await fetch(`/users/${userId}/weather`);
    const userWeatherData = await userWeatherResponse.json();

    if (!userWeatherData || userWeatherData.length === 0) {
      throw new Error("Weather data not found for this user");
    }

    const latestWeatherData = userWeatherData[userWeatherData.length - 1];

    const temperatureCelsius = (
      latestWeatherData.weather.main.temp - 273.15
    ).toFixed(2);
    const feelsLikeCelsius = (
      latestWeatherData.weather.main.feels_like - 273.15
    ).toFixed(2);
    const timestamp = latestWeatherData.timestamp;
    const timezoneResponse = await fetch(
      `/timezone?lat=${lat}&lon=${lon}&timestamp=${timestamp}`
    );
    const timezoneData = await timezoneResponse.json();
    const timezone = timezoneData.zoneName;
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timezone,
    });

    const weatherInfo = document.getElementById("weather-info");
    weatherInfo.innerHTML = `
      <div class="weather-card">
        <p>City: ${city}</p>
        <p>Temperature: ${temperatureCelsius}°C</p>
        <p>Description: ${latestWeatherData.weather.weather[0].description}</p>
        <img src="http://openweathermap.org/img/wn/${
          latestWeatherData.weather.weather[0].icon
        }.png" alt="Weather Icon">
        <p>Coordinates: ${lat}, ${lon}</p>
        <p>Feels Like: ${feelsLikeCelsius}°C</p>
        <p>Humidity: ${latestWeatherData.weather.main.humidity}%</p>
        <p>Pressure: ${latestWeatherData.weather.main.pressure} hPa</p>
        <p>Wind Speed: ${latestWeatherData.weather.wind.speed} m/s</p>
        <p>Country Code: ${latestWeatherData.weather.sys.country}</p>
        <p>Air Quality Index: ${latestWeatherData.airQualityIndex || "N/A"}</p>
        <p>Date: ${formattedDate}</p>
        <p id="current-time"></p>
        <p>Timezone: ${timezone}</p>
      </div>
    `;

    showMap("map", lat, lon, city, timezone);

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

    const weatherDescription = latestWeatherData.weather.weather[0].description;
    changeBackgroundImage(weatherDescription);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function getUserIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("userId");
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
    getWeather(lat, lon, city);
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
  getWeather(lat, lon, city);
}

async function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const city = await getCityFromCoordinates(lat, lon);
      getWeather(lat, lon, city);
    });
  } else {
    alert("Geolocation is not supported by your browser");
  }
}

async function getCityFromCoordinates(lat, lon) {
  const reverseGeocodingResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  );
  const reverseGeocodingData = await reverseGeocodingResponse.json();
  if (reverseGeocodingData.address && reverseGeocodingData.address.city) {
    return reverseGeocodingData.address.city;
  } else {
    return null;
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
  map.on("click", async function (e) {
    const selectedCityLat = e.latlng.lat;
    const selectedCityLon = e.latlng.lng;
    const city = await getCityFromCoordinates(selectedCityLat, selectedCityLon);
    console.log(city);
    getWeather(selectedCityLat, selectedCityLon, city);
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
  const userId = getUserIdFromUrl();
  if (userId) {
    fetch(`/users/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((user) => {
        const username = user ? user.name : "User";
        const usernameElement = document.getElementById("username");
        usernameElement.textContent = `Welcome, ${username}!`;
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }

  const exitButton = document.getElementById("exit-button");
  exitButton.addEventListener("click", function () {
    window.location.href = "/";
  });
});
