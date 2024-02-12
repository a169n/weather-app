const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/db");
const app = express();

const User = require("./models/userSchema");
const WeatherData = require("./models/weatherDataSchema");

require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

connectDB();

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/weather", async (req, res) => {
  try {
    const { lat, lon, userId } = req.body;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    const weatherData = weatherResponse.data;

    await WeatherData.create({
      userId: userId,
      city: weatherData.name,
      latitude: weatherData.coord.lat,
      longitude: weatherData.coord.lon,
      weather: weatherData,
      timestamp: new Date().toISOString(),
    });

    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

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
      return res.status(400).json({ error: "User is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/weather", (req, res) => {
  res.status(200).render("weather");
});

app.get("/admin", (req, res) => {
  res.status(200).render("admin");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Username not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Username or password does not match" });
    }

    if (user.isAdmin) {
      if (req.accepts("json")) {
        return res
          .status(200)
          .json({
            success: true,
            redirectUrl: `/admin?userId=${user._id}`,
            username: user.name,
          });
      } else {
        return res.status(200).render("admin");
      }
    } else {
      if (req.accepts("json")) {
        return res
          .status(200)
          .json({
            success: true,
            redirectUrl: `/weather?userId=${user._id}`,
            username: user.name,
          });
      } else {
        return res.status(200).render("weather");
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
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

app.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/users/:userId/weather", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const weatherData = await WeatherData.find({ userId });

    if (!weatherData || weatherData.length === 0) {
      return res
        .status(404)
        .json({ error: "Weather data not found for this user" });
    }

    res.status(200).json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data from user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, email, isAdmin } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, isAdmin },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/users/:userId/weather", async (req, res) => {
  const { userId } = req.params;
  const { city, latitude, longitude, weather, timestamp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newWeatherData = await WeatherData.create({
      userId: userId,
      city,
      latitude,
      longitude,
      weather,
      timestamp,
    });

    res.status(200).json(newWeatherData);
  } catch (error) {
    console.error("Error saving weather data to user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/users/:userId/admin", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isAdmin = true;
    await user.save();

    res.status(200).json({ message: `User ${user.name} is now Admin` });
  } catch (error) {
    console.error("Error making user admin:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/weathers", async (req, res) => {
  try {
    await WeatherData.deleteMany();

    res.status(200).json({ message: "All weather data cleared successfully." });
  } catch (error) {
    console.error("Error clearing weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/users/:userId/admin", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isAdmin = false;
    await user.save();

    res.status(200).json({ message: `User ${user.name} is no longer Admin` });
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/users", async (req, res) => {
  try {
    await User.deleteMany();
    res.status(200).json({ message: "All users deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}`);
});
