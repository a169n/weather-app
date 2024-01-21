const express = require("express");
const axios = require("axios");
const app = express();

require("dotenv").config();

app.use(express.static("public"));

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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}`);
});
