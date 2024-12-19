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
  const locationForecast = await getLocationForecast(locationCoordinates.latitude, locationCoordinates.longitude);
  if ("error" in locationForecast) {
    context.data = { error: locationForecast.error };
    return;
  }

  // Final data for the context
  context.data = {
    weather: {
      location: `${locationCoordinates.locationName}, ${locationCoordinates.locationAdmin1}, ${locationCoordinates.locationCountry}`,
      current: locationForecast.current,
      daily: locationForecast.daily
    }
  };
});

context.ondata = (event) => {
  if (event.data.error) {
    document.body.innerText = `Error: ${event.data.error}`;
  }

  // Setup variables for the HTML output
  const locationName = event.data.weather.location;
  const forecastDataCurrent = event.data.weather.current;
  const forecastDataDaily = event.data.weather.daily.time.map((time: string, index: number) => ({
    time,
    temperatureMax: event.data.weather.daily.temperature_2m_max[index],
    temperatureMin: event.data.weather.daily.temperature_2m_min[index],
    weatherCode: event.data.weather.daily.weather_code[index]
  }));

  // HTML output
  const fragment = document.createDocumentFragment();

  // Today/Current Weather
  const p = document.createElement("p");
  p.textContent = `Current Temperature: ${forecastDataCurrent.temperature_2m}°C - Today's weather in ${locationName}: `;
  const span = document.createElement("span");
  span.textContent = `High ${forecastDataDaily[0].temperatureMax}°C / Low ${forecastDataDaily[0].temperatureMin}°C - Current Weather Code: ${forecastDataCurrent.weather_code}`;
  p.appendChild(span);
  fragment.appendChild(p);

  forecastDataDaily.forEach((forecastDataDaily, index) => {
    // Avoid to show today's weather in the next days forecast
    if (index === 0) {
      return;
    }

    const p = document.createElement("p");
    p.textContent = `Day: ${getDayOfWeek(forecastDataDaily.time)} - Temperature: ${
      forecastDataDaily.temperatureMax
    }°C / ${forecastDataDaily.temperatureMin}°C - Weather Code: ${forecastDataDaily.weatherCode}`;
    fragment.appendChild(p);
  });

  // Update the document body in a single operation
  document.body.replaceChildren(fragment);
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
 * Gets the location forecast from the weather API.
 * @param latitude The latitude of the location.
 * @param longitude The longitude of the location.
 * @returns The location forecast, or an error message.
 */
const getLocationForecast = async (latitude: number, longitude: number) => {
  const weatherAPIUrl = "https://api.open-meteo.com/v1/forecast";

  const weatherResponse = await fetch(
    `${weatherAPIUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
  );

  const weatherData = await weatherResponse.json();

  if (weatherData.error) {
    return { error: weatherData.error.reason };
  }

  return {
    current: weatherData.current,
    daily: weatherData.daily
  };
};

/**
 * Gets the day of the week from a date string.
 * @param dateString The date string to format.
 * @returns The day of the week (short format).
 */
const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.toLocaleString("en-US", { weekday: "short" });
  return day;
};
