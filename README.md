# Weather App

A simple weather application that provides weather information based on location.

## Prerequisites

Before running the application, make sure you have the following:

- [Node.js](https://nodejs.org/) installed on your machine
- API keys for the following services:
  - [OpenWeather](https://openweathermap.org/api)
  - [Unsplash](https://unsplash.com/developers)
  - [OpenAQ](https://docs.openaq.org/#api-Overview)
  - [TimezoneDB](https://timezonedb.com/api)

## Installation

1. **Clone the repository:**

   ```bash
   https://github.com/a169n/weather-app.git

2. **Navigate to the project directory:**

   ```bash
   cd your-repo

1. **Install the required npm packages:**

   ```bash
   npm install

## Configuration

1. **Create a .env file in the root directory of the project.**

2. **Add the following environment variables to the .env file:**
    ```bash
    PORT = 3000
    OPENWEATHER_API_KEY = 751f1880e357af46026e44fa855dd102
    UNSPLASH_API_KEY = SOA6Q1M5Q4FzVBAWGg0JhyNIHjKfqGzbbDljY5GGfJY
    OPENAQ_API_KEY = a27ef85d31480c5cd8036e54d56d14de5a6842415ee9899f24e39605d32836f9
    TIMEZONE_DB_API_KEY = BB5CW5D7IZBX

## Running the application

1. **Start the server**
    ```bash
       npm run server
    
**The server will be running at http://localhost:3000**


## Usage

1. Open your web browser and navigate to http://localhost:3000.

2. Enter a city name, latitude, and longitude, or use the provided buttons to get weather information.

3. Explore the weather details, including temperature, description, and more.

## Usage of APIs

### 1. OpenWeather API

- **Endpoint:** `/weather`
- **Parameters:**
  - `lat`: Latitude of the location
  - `lon`: Longitude of the location
- **Example Request:**

  ```bash
  curl http://localhost:3000/weather?lat=37.7749&lon=-122.4194

### 2. Unsplash API

- **Endpoint:** `/background`
- **Parameters:**
  - `description`: Description of the weather or location
- **Example Request:**

  ```bash
  curl http://localhost:3000/background?description=sunny%20day

### 3. OpenAQ API

- **Function:** `getAirQualityIndex(lat, lon)`
- **Parameters:**
  - `lat`: Latitude of the location
  - `lon`: Longitude of the location
- **Example Request:**

  ```bash
  getAirQualityIndex(37.7749, -122.4194);


### 4. TimezoneDB API

- **Endpoint:** `/timezone`
- **Parameters:**
  - `lat`: Latitude of the location
  - `lon`: Longitude of the location
  - `timestamp`: UNIX timestamp
- **Example Request:**

  ```bash
  curl http://localhost:3000/timezone?lat=37.7749&lon=-122.4194&timestamp=1642742400


## Lisence

Free to use ;)


  






