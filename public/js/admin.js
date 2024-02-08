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
        getWeatherData(user.name)
      );

      li.appendChild(getWeatherButton);

      if (!user.isAdmin) {
        const makeAdminButton = document.createElement("button");
        makeAdminButton.textContent = "Make Admin";
        makeAdminButton.addEventListener("click", () => makeAdmin(user.name));

        li.appendChild(makeAdminButton);
      }

      userList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
});

async function getWeatherData(username) {
  try {
    const response = await fetch(`/users/${username}/weather`);
    const weatherData = await response.json();
    const weatherDisplay = document.getElementById("weather-data");
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

async function makeAdmin(username) {
  try {
    await fetch(`/users/${username}/makeAdmin`, { method: "POST" });
  } catch (error) {
    console.error("Error making user admin:", error);
  }
}
