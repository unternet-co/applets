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
  const grid = document.createElement("div");
  grid.classList.add("main-grid");

  // Today / Current Weather
  const gridItemToday = document.createElement("div");
  gridItemToday.classList.add("item-today");

  const gridItemLocation = document.createElement("p");
  gridItemLocation.textContent = `Weather in ${locationName}`;

  const gridItemTodayImage = document.createElement("img");
  if (forecastDataCurrent.weather_code <= 2) {
    gridItemTodayImage.src = `/weather/images/${forecastDataCurrent.weather_code}_${
      forecastDataCurrent.is_day ? "day" : "night"
    }.png`;
  } else {
    gridItemTodayImage.src = `/weather/images/${forecastDataCurrent.weather_code}.png`;
  }

  const gridItemTodayWeather = document.createElement("div");
  gridItemTodayWeather.classList.add("item-today-weather");
  gridItemTodayWeather.innerHTML = `
    <p>Today</p>
    <p>${getWeatherConditions(forecastDataCurrent.weather_code, forecastDataCurrent.is_day)}</p>
    <div>
      <p>High <span>${forecastDataDaily[0].temperatureMax}°C</span></p>
      <p>Low <span>${forecastDataDaily[0].temperatureMin}°C</span></p>
    </div>
  `;

  gridItemToday.appendChild(gridItemLocation);
  gridItemToday.appendChild(gridItemTodayImage);
  gridItemToday.appendChild(gridItemTodayWeather);
  grid.appendChild(gridItemToday);

  // Daily Forecast (Next 6 days)
  forecastDataDaily.forEach((forecastDataDaily, index) => {
    // Avoid to show today's weather in the next days forecast
    if (index === 0) {
      return;
    }

    const gridItemForecast = document.createElement("div");
    gridItemForecast.classList.add("item-forecast-day");

    const gridItemForecastDay = document.createElement("p");
    gridItemForecastDay.textContent = getDayOfWeek(forecastDataDaily.time);

    const gridItemForecastImage = document.createElement("img");
    gridItemForecastImage.src = `/weather/images/${forecastDataDaily.weatherCode}.png`;

    const gridItemForecastHight = document.createElement("p");
    gridItemForecastHight.textContent = `${forecastDataDaily.temperatureMax}`;

    const gridItemForecastLow = document.createElement("p");
    gridItemForecastLow.textContent = `${forecastDataDaily.temperatureMin}`;

    gridItemForecast.appendChild(gridItemForecastDay);
    gridItemForecast.appendChild(gridItemForecastImage);
    gridItemForecast.appendChild(gridItemForecastHight);
    gridItemForecast.appendChild(gridItemForecastLow);

    grid.appendChild(gridItemForecast);
  });

  fragment.appendChild(grid);

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
    `${weatherAPIUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
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

/**
 * Gets the weather conditions from a weather code.
 * The weather code comes from a WMO standard.
 * @param weatherCode The weather code to get the weather conditions from.
 * @param isDay Whether the weather is day or night.
 * @returns The weather conditions.
 */
const getWeatherConditions = (weatherCode: number, isDay?: boolean) => {
  switch (weatherCode) {
    case 0:
      return isDay ? "Sunny" : "Clear";
    case 1:
      return isDay ? "Mostly Sunny" : "Mostly Clear";
    case 2:
      return "Partly Cloudy";
    case 3:
      return "Overcast";
    case 45:
      return "Fog";
    case 48:
      return "Icy Fog";
    case 51:
      return "Light Drizzle";
    case 53:
      return "Drizzle";
    case 55:
      return "Heavy Drizzle";
    case 56:
      return "Light Icy Drizzle";
    case 57:
      return "Icy Drizzle";
    case 61:
      return "Light Rain";
    case 63:
      return "Rain";
    case 65:
      return "Heavy Rain";
    case 66:
      return "Light Icy Rain";
    case 67:
      return "Icy Rain";
    case 71:
      return "Light Snow";
    case 73:
      return "Snow";
    case 75:
      return "Heavy Snow";
    case 77:
      return "Snow Grains";
    case 80:
      return "Light Showers";
    case 81:
      return "Showers";
    case 82:
      return "Heavy Showers";
    case 85:
      return "Light Snow Showers";
    case 86:
      return "Snow Showers";
    case 95:
      return "Thunderstorm";
    case 96:
      return "Thunderstorms With Light Hail";
    case 99:
      return "Thunderstorms With Hail";
    default:
      return "";
  }
};
