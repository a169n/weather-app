document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Fetch and display existing users
    const response = await fetch("/users");
    const users = await response.json();
    const userList = document.getElementById("user-list");

    users.forEach((user) => {
      const li = document.createElement("li");
      li.classList.add("user-info");

      const id = document.createElement("p");
      id.textContent = `ID: ${user._id}`;

      const username = document.createElement("p");
      username.textContent = `Username: ${user.name}`;

      const email = document.createElement("p");
      email.textContent = `Email: ${user.email}`;

      const isAdmin = document.createElement("p");
      isAdmin.textContent = `Admin: ${user.isAdmin ? "Yes" : "No"}`;

      const getWeatherButton = document.createElement("button");
      getWeatherButton.textContent = "Get Weather Data";
      getWeatherButton.dataset.userId = user._id;
      getWeatherButton.dataset.weatherVisible = "false";
      getWeatherButton.classList.add("btn", "btn-primary");
      getWeatherButton.addEventListener("click", () => toggleWeather(user._id));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("btn", "btn-danger");
      deleteButton.addEventListener("click", () => deleteUser(user._id));

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("btn", "btn-secondary");
      editButton.addEventListener("click", () =>
        editUser(user._id, user.name, user.email, user.isAdmin)
      );

      const toggleAdminButton = document.createElement("button");
      toggleAdminButton.textContent = user.isAdmin
        ? "Remove Admin"
        : "Make Admin";
      toggleAdminButton.classList.add("btn", "btn-info");
      toggleAdminButton.addEventListener("click", () =>
        toggleAdmin(user._id, !user.isAdmin)
      );

      li.appendChild(id);
      li.appendChild(username);
      li.appendChild(email);
      li.appendChild(isAdmin);
      li.appendChild(getWeatherButton);
      li.appendChild(deleteButton);
      li.appendChild(editButton);
      li.appendChild(toggleAdminButton);

      userList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  // Handle form submission to add a new user
  const addUserForm = document.getElementById("add-user-form");
  addUserForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const isAdmin = document.getElementById("admin").checked;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          isAdmin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add user");
      }

      const userData = await response.json();
      console.log(userData); // Assuming the response includes user data

      // Display alert and clear input fields
      alert("User created successfully");
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
      document.getElementById("confirm-password").value = "";
      document.getElementById("admin").checked = false;

      location.reload();
    } catch (error) {
      console.error("Error adding user:", error);
      // Handle error (e.g., display error message to the user)
    }
  });
});

async function toggleWeather(userId) {
  const getWeatherButton = document.querySelector(
    `button[data-user-id="${userId}"]`
  );
  const userIds = document.querySelectorAll("[data-user-id]");

  if (getWeatherButton.dataset.weatherVisible === "false") {
    for (const id of userIds) {
      id.textContent === `ID: ${userId}`
        ? id.nextElementSibling.classList.add("show-weather-data")
        : id.nextElementSibling.classList.remove("show-weather-data");
    }
    getWeatherButton.dataset.weatherVisible = "true";
    getWeatherButton.textContent = "Close Weather Data";
    await getWeatherData(userId);
  } else {
    getWeatherButton.dataset.weatherVisible = "false";
    getWeatherButton.textContent = "Get Weather Data";
    const weatherDisplay = document.getElementById("weather-data");
    weatherDisplay.innerHTML = "";
    weatherDisplay.classList.remove("show-weather-data");
  }
}

async function getWeatherData(userId) {
  try {
    const response = await fetch(`/users/${userId}/weather`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "User does not have weather data");
    }

    const weatherData = await response.json();

    console.log(weatherData);
    const weatherDisplay = document.getElementById("weather-data");

    const userResponse = await fetch(`/users/${userId}`);
    const userData = await userResponse.json();

    weatherDisplay.innerHTML = `Username: ${userData.name}`;

    if (Array.isArray(weatherData) && weatherData.length === 0) {
      alert("No weather data available for this user.");
    } else {
      const weatherList = document.createElement("ol");
      weatherData.forEach((data) => {
        const weatherInfo = document.createElement("li");
        const temperatureCelsius = (data.weather.main.temp - 273.15).toFixed(2);
        const feelsLikeCelsius = (
          data.weather.main.feels_like - 273.15
        ).toFixed(2);
        const timestamp = new Date(data.timestamp);
        const formattedTimestamp = timestamp.toLocaleString();
        weatherInfo.innerHTML = `
          <p>City: ${data.city}</p>
          <p>Temperature: ${temperatureCelsius}°C</p>
          <p>Description: ${data.weather.weather[0].description}</p>
          <p>Coordinates: ${data.latitude}, ${data.longitude}</p>
          <p>Feels Like: ${feelsLikeCelsius}°C</p>
          <p>Humidity: ${data.weather.main.humidity}%</p>
          <p>Pressure: ${data.weather.main.pressure} hPa</p>
          <p>Wind Speed: ${data.weather.wind.speed} m/s</p>
          <p>Country Code: ${data.weather.sys.country}</p>
          <p>Date : ${formattedTimestamp}</p>
        `;
        weatherList.appendChild(weatherInfo);
      });
      weatherDisplay.appendChild(weatherList);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again later.");
  }
}

async function deleteUser(userId) {
  try {
    const response = await fetch(`/users/${userId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      location.reload();
    } else {
      console.error("Failed to delete user:", response.statusText);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

async function editUser(userId, name, email, isAdmin) {
  try {
    const newName = prompt("Enter new name:", name);
    const newEmail = prompt("Enter new email:", email);
    const isAdminInput = prompt("Is admin? (true/false)", isAdmin);
    const newIsAdmin = isAdminInput.toLowerCase() === "true";

    const response = await fetch(`/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        isAdmin: newIsAdmin,
      }),
    });

    if (response.ok) {
      location.reload();
    } else {
      console.error("Failed to edit user:", response.statusText);
    }
  } catch (error) {
    console.error("Error editing user:", error);
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
