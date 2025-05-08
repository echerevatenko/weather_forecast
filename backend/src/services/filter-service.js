/**
 * Find temperature data for requested date/time
 *
 * @param temperatureData
 * @param day
 * @param time
 * @returns {null|*}
 */
export function filterTemperatureData(temperatureData, day, time) {
  const dateISO = day + 'T' + time + ':00Z';

  const filteredData = temperatureData.filter((val) => {
    return val.time === dateISO;
  });

  if (filteredData.length === 0) {
    throw new RequestFormatException('Request date/time is out of range');
  }

  return filteredData[0].temperature;
}
