const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    city: String,
    latitude: Number,
    longitude: Number,
    weatherData: [
      {
        city: String,
        latitude: Number,
        longitude: Number,
        weather: Object,
        timestamp: Date,
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
