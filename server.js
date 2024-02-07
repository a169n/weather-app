const express = require("express");
const bcrypt = require("bcrypt");
const axios = require("axios");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/db");
const app = express();
const User = require("./models/userSchema");

require("dotenv").config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

connectDB();

app.get("/", (req, res) => {
  res.redirect(__dirname + "/login.html");
});

app.get("/weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    const weatherData = weatherResponse.data;
    const airQualityIndex = await getAirQualityIndex(lat, lon);

    res.json({
      ...weatherData,
      airQualityIndex: airQualityIndex,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

async function getAirQualityIndex(lat, lon) {
  try {
    const openAQApiKey = process.env.OPENAQ_API_KEY;
    const airQualityResponse = await axios.get(
      `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&apiKey=${openAQApiKey}`
    );

    const airQualityData = airQualityResponse.data;
    const airQualityIndex = airQualityData.results[0].measurements.find(
      (measurement) => measurement.parameter === "pm25"
    ).value;

    return airQualityIndex;
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    return "N/A";
  }
}

app.get("/background", async (req, res) => {
  try {
    const description = req.query.description;
    const unsplashApiKey = process.env.UNSPLASH_API_KEY;
    const unsplashApiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      description
    )}&client_id=${unsplashApiKey}`;

    const unsplashResponse = await axios.get(unsplashApiUrl);
    const unsplashData = unsplashResponse.data;

    res.json(unsplashData);
  } catch (error) {
    console.error("Error fetching background image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/timezone", async (req, res) => {
  try {
    const { lat, lon, timestamp } = req.query;
    const timezoneApiKey = process.env.TIMEZONE_DB_API_KEY;

    const timezoneResponse = await axios.get(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}&time=${timestamp}`
    );

    const timezoneData = timezoneResponse.data;
    res.json(timezoneData);
  } catch (error) {
    console.error("Error fetching timezone data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    const existingEmail = await User.findOne({ name });

    if (existingUser || existingEmail) {
      alert("User is already registered");
      return res.status(400).json({ error: "User is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ email: username });

    if (!user) {
      return res.status(401).json({ success: false, error: "Username not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Username or password does not match" });
    }

    res.status(200).json({ success: true, redirectUrl: "/weather.html" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/users/delete", async (req, res) => {
  try {
    await User.deleteMany();
    res.status(200).json({ message: "All users deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}`);
});
