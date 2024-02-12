document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/users");
    const users = await response.json();
    const userList = document.getElementById("user-list");

    users.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user.name + (user.isAdmin ? " (Admin)" : "");

      const getWeatherButton = document.createElement("button");
      getWeatherButton.textContent = "Get Weather Data";
      getWeatherButton.addEventListener("click", () =>
        getWeatherData(user._id)
      );

      li.appendChild(getWeatherButton);

      if (!user.isAdmin) {
        const makeAdminButton = document.createElement("button");
        makeAdminButton.textContent = "Make Admin";
        makeAdminButton.addEventListener("click", () => toggleAdmin(user._id, true));

        li.appendChild(makeAdminButton);
      } else {
        const disableAdminButton = document.createElement("button");
        disableAdminButton.textContent = "Disable Admin";
        disableAdminButton.addEventListener("click", () => toggleAdmin(user._id, false));

        li.appendChild(disableAdminButton);
      }

      userList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
});

async function getWeatherData(userId) {
  try {
    const response = await fetch(`/users/${userId}/weather`);
    const weatherData = await response.json();
    console.log(weatherData); // Log the weatherData object
    const weatherDisplay = document.getElementById("weather-data");

    // Clear previous weather data if any
    weatherDisplay.innerHTML = "";

    // Create elements to display the weather data
    const weatherInfo = document.createElement("div");
    weatherInfo.textContent = `City: ${weatherData[0].city}, Weather: ${weatherData[0].weather}, Timestamp: ${weatherData[0].timestamp}`;

    // Append weather info to the weather display element
    weatherDisplay.appendChild(weatherInfo);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}



async function toggleAdmin(userId, makeAdmin) {
  try {
    const method = makeAdmin ? "POST" : "DELETE";
    await fetch(`/users/${userId}/admin`, { method });
    location.reload();
  } catch (error) {
    console.error("Error toggling admin status:", error);
  }
}
