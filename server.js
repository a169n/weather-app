const express = require("express");
const axios = require("axios");
const app = express();

require("dotenv").config();

app.use(express.static("public"));

app.get("/weather", async (req, res) => {
  try {
    const {
      lat,
      lon
    } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    const weatherData = weatherResponse.data;
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

app.get("/background", async (req, res) => {
  try {
    const description = req.query.description;
    const unsplashApiKey = process.env.UNSPLASH_API_KEY;
    const unsplashApiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(description)}&client_id=${unsplashApiKey}`;
    
    const unsplashResponse = await axios.get(unsplashApiUrl);
    const unsplashData = unsplashResponse.data;
    
    res.json(unsplashData);
  } catch (error) {
    console.error('Error fetching background image:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}`);
});