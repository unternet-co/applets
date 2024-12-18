import { applets } from "@web-applets/sdk";

const context = applets.getContext();

context.setActionHandler("get_weather", async ({ location }) => {
  // First, get the location coordinates
  const locationCoordinates = await getLocationCoordinates(location);
  if ("error" in locationCoordinates) {
    context.data = { error: locationCoordinates.error };
    return;
  }

  // Get the weather forecast for the location coordinates
  const locationTodayWeather = await getLocationTodayWeather(
    locationCoordinates.latitude,
    locationCoordinates.longitude
  );
  if ("error" in locationTodayWeather) {
    context.data = { error: locationTodayWeather.error };
    return;
  }

  // Variables for the data results in the context
  const locationName = `${locationCoordinates.locationName}, ${locationCoordinates.locationAdmin1}, ${locationCoordinates.locationCountry}`;
  const locationWeatherHourlyTime = locationTodayWeather.time;
  const locationWeatherHourlyTemperature = locationTodayWeather.temperature;
  const locationWeatherHourlyPrecipitationProbability = locationTodayWeather.precipitationProbability;

  // Final data for the context
  context.data = {
    weather: {
      location: locationName,
      time: locationWeatherHourlyTime,
      temperature: locationWeatherHourlyTemperature,
      precipitationProbability: locationWeatherHourlyPrecipitationProbability
    }
  };
});

context.ondata = (event) => {
  if (event.data.error) {
    document.body.innerText = `Error: ${event.data.error}`;
  }

  // Setup variables for the HTML output
  const locationName = event.data.weather.location;
  const forecastData = event.data.weather.time.map((time: string, index: number) => ({
    time,
    temperature: event.data.weather.temperature[index],
    precipitationProbability: event.data.weather.precipitationProbability[index]
  }));

  // HTML output
  document.body.innerHTML = `
  <p>Here is the forecast for <strong>${formatDate(
    forecastData[0].time
  )}</strong> in the location <strong>${locationName}</strong></p>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Temperature</th>
        <th>Precipitation Probability</th>
      </tr>
    </thead>
    <tbody>
      ${forecastData
        .map(
          (row) => `
        <tr>
          <td>${row.time.split("T")[1].slice(0, 5)}</td>
          <td>${row.temperature}°C</td>
          <td>${row.precipitationProbability}%</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
`;
};

/**
 * Gets the location coordinates from the geocoding API.
 * @param location The location to get the coordinates for.
 * @returns The location coordinates, or an error message.
 */
const getLocationCoordinates = async (location: string) => {
  const geocodingAPIUrl = "https://geocoding-api.open-meteo.com/v1/search";

  const geocodingResponse = await fetch(
    `${geocodingAPIUrl}?name=${encodeURIComponent(location)}&count=10&language=en&format=json`
  );
  const geocodingData = await geocodingResponse.json();

  if (!geocodingData.results) {
    return {
      error: "Location not found"
    };
  }

  return {
    latitude: geocodingData.results[0].latitude,
    longitude: geocodingData.results[0].longitude,
    locationName: geocodingData.results[0].name,
    locationAdmin1: geocodingData.results[0].admin1,
    locationCountry: geocodingData.results[0].country
  };
};

/**
 * Gets the weather forecast for a location.
 * @param latitude The latitude of the location.
 * @param longitude The longitude of the location.
 * @returns The weather forecast for current day, or an error message.
 */
const getLocationTodayWeather = async (latitude: number, longitude: number) => {
  const weatherAPIUrl = "https://api.open-meteo.com/v1/forecast";

  const weatherResponse = await fetch(
    `${weatherAPIUrl}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability&timezone=auto&forecast_days=1`
  );
  const weatherData = await weatherResponse.json();

  if (weatherData.error) {
    return { error: weatherData.error.reason };
  }

  return {
    time: weatherData.hourly.time,
    temperature: weatherData.hourly.temperature_2m,
    precipitationProbability: weatherData.hourly.precipitation_probability
  };
};

/**
 * Formats a date string into a readable format.
 * @param dateString The date string to format.
 * @returns The formatted date string.
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3 ? 0 : day % 10) * (day < 11 || day > 13 ? 1 : 0)] || "th";
  return `${month} ${day}${suffix}`;
};
