# Weather App

A simple weather application with registration/login system that provides weather information based on location.

## Admin Panel

- You can access the admin panel using the following credentials:
```bash
Email: admin
Password: admin
```

### Admin Panel Functions
- The admin panel provides access to administrative functions for managing users and other aspects of the application. Here are the key functions:

* View a list of registered users.
* Edit user profiles.
* Delete user accounts.
* Grant or revoke privileges.
* Authorization and Authentication:

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
    MONGO_URI = mongodb+srv://a1byn:a169n005@daryntech.jxuelry.mongodb.net/weather_db?retryWrites=true&w=majority
    OPENWEATHER_API_KEY = 751f1880e357af46026e44fa855dd102
    UNSPLASH_API_KEY = SOA6Q1M5Q4FzVBAWGg0JhyNIHjKfqGzbbDljY5GGfJY
    OPENAQ_API_KEY = a27ef85d31480c5cd8036e54d56d14de5a6842415ee9899f24e39605d32836f9
    TIMEZONE_DB_API_KEY = BB5CW5D7IZBX

## Running the application

1. **Start the server**
    ```bash
    npm run dev
    
**The server will be running at http://localhost:3000**


## Endpoints
1. ```GET "/"```
   - Renders the index page.

2. ```POST "/weather"```
   - Fetches weather data based on latitude, longitude, and user ID.
   - Saves the weather data in the database.

3. ```GET "/background"```
   - Fetches a random background image based on a query parameter.

4. ```GET "/timezone"```
   - Fetches timezone data based on latitude, longitude, and timestamp.

5. ```POST "/register"```
   - Registers a new user.
   - Checks if passwords match.
   - Hashes the password before saving it to the database.

6. ```GET "/weather"```
   - Renders the weather page.

7. ```GET "/admin"```
   - Renders the admin page.

8. ```POST "/login"```
   - Logs in a user.
   - Checks credentials and redirects to the appropriate page based on user type (admin or regular user).

9. ```GET "/users"```
   - Retrieves all users from the database.

10. ```GET "/users/:userId"```
    - Retrieves a specific user by ID.

11. ```GET "/users/:userId/weather"```
    - Retrieves weather data for a specific user by ID.

12. ```PUT "/users/:userId"```
    - Updates user information.

13. ```POST "/users/:userId/weather"```
    - Saves weather data for a specific user.

14. ```POST "/users/:userId/admin"```
    - Grants admin privileges to a user.

15. ```DELETE "/weathers"```
    - Deletes all weather data.

16. ```DELETE "/users/:userId/admin"```
    - Removes admin privileges from a user.

17. ```DELETE "/users"```
    - Deletes all users.

18. ```DELETE "/users/:id"```
    - Deletes a specific user by ID.

## Usage

1. Open your web browser and navigate to http://localhost:3000.

2. Enter a city name, latitude, and longitude, or use the provided buttons to get weather information.

3. Explore the weather details, including temperature, description, and more.

## Prerequisites

Before running the application, make sure you have the following:

- [Node.js](https://nodejs.org/) installed on your machine
- API keys for the following services:
  - [OpenWeather](https://openweathermap.org/api)
  - [Unsplash](https://unsplash.com/developers)
  - [OpenAQ](https://docs.openaq.org/#api-Overview)
  - [TimezoneDB](https://timezonedb.com/api)

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


  






