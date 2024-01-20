let map;

async function getWeather(lat, lon, city) {
  const response = await fetch(`/weather?lat=${lat}&lon=${lon}`);
  const data = await response.json();

  const temperatureCelsius = data.main.temp - 273.15;
  const feelsLikeCelsius = data.main.feels_like - 273.15;

  const weatherInfo = document.getElementById("weather-info");
  weatherInfo.innerHTML = `
    <p>City: ${data.name}</p>
    <p>Temperature: ${temperatureCelsius.toFixed(2)}°C</p>
    <p>Description: ${data.weather[0].description}</p>
    <img src="http://openweathermap.org/img/wn/${
      data.weather[0].icon
    }.png" alt="Weather Icon">
    <p>Coordinates: ${data.coord.lat}, ${data.coord.lon}</p>
    <p>Feels Like: ${feelsLikeCelsius.toFixed(2)}°C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Pressure: ${data.main.pressure} hPa</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <p>Country Code: ${data.sys.country}</p>
    <p>Rain Volume (last 3 hours): ${data.rain ? data.rain["1h"] : 0} mm</p>
  `;

  showMap("map", data.coord.lat, data.coord.lon, data.name);

  const prompt = data.weather[0].description + ' ' + data.name + ' in ' + data.sys.country;
  console.log(prompt);

  changeBackgroundImage([prompt]);
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
      getWeather(lat, lon);
    });
  } else {
    alert("Geolocation is not supported by your browser");
  }
}

function showMap(containerId, lat, lon, cityName) {
  if (!map) {
    map = L.map(containerId).setView([lat, lon], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
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
    getWeather(selectedCityLat, selectedCityLon);
    map.off("click");
  });
}

function changeBackgroundImage(description) {
  fetch(`/background?description=${encodeURIComponent(description)}`)
    .then(response => response.json())
    .then(data => {
      const backgroundImageUrl = data.urls.regular;
      document.body.style.backgroundImage = `url(${backgroundImageUrl})`;
    })
    .catch(error => {
      console.error('Error fetching background image:', error);
    });
}

