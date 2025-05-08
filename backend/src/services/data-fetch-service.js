import { ApiRequestException } from '../exceptions/api-request-exception.js';
import { RequestFormatException } from '../exceptions/request-format-exception.js';

/**
 * Cities latitude and longitude
 *
 * @type {Readonly<{BELGRADE: {lat: number, long: number}, MOSCOW: {lat: number, long: number}, NEW_YORK: {lat: number, long: number}}>}
 */
const cities = Object.freeze({
  BELGRADE: { lat: 44.78, long: 20.45 },
  MOSCOW: { lat: 55.75, long: 37.62 },
  NEW_YORK: { lat: 40.73, long: -73.94 },
});

/**
 * Fetching weather data from external api
 *
 * @param city
 * @returns {Promise<*|{}>}
 */
export async function fetchWeatherData(city) {
  const apiUrl = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
  let timeSeriesData = {};

  const cityCoords = cities[city];

  if (cityCoords === undefined) {
    throw new RequestFormatException('Wrong city');
  }

  let fetchUrl = apiUrl.concat('?lat=' + cityCoords.lat, '&lon=' + cityCoords.long);

  try {
    const response = await fetch(fetchUrl);
    const json = await response.json();
    timeSeriesData = json.properties.timeseries;
  } catch (err) {
    throw new ApiRequestException('Api request failed');
  }

  if (timeSeriesData.length === 0) {
    throw new ApiRequestException('Api request returned zero data');
  }

  return timeSeriesData;
}
