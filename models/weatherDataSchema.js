const mongoose = require("mongoose");

const weatherDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    city: String,
    latitude: Number,
    longitude: Number,
    weather: Object,
    timestamp: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WeatherData", weatherDataSchema);
