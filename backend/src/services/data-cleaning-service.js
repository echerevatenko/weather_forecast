/**
 * Remove unnecessary data, leaving only time and temperature
 *
 * @param data
 * @returns {*}
 */
export function cleanData(data) {
  return data.map((val, key) => {
    return {
      time: val.time,
      temperature: val.data.instant.details.air_temperature,
    };
  });
}
