/**
 * Filling missing data with null values
 *
 * @param data
 * @returns {*[]}
 */
function fillGapsWithNull(data) {
  const dataToFill = [...data];

  for (let i = 1; i < dataToFill.length; i++) {
    // fill data if difference between current and previous element is more than 1 hour
    if ((new Date(dataToFill[i].time).getTime() - new Date(dataToFill[i - 1].time).getTime()) / 3600000 > 1) {
      let date = new Date(dataToFill[i - 1].time);
      date.setTime(date.getTime() + 60 * 60 * 1000);
      dataToFill.splice(i, 0, {
        time: date.toISOString().replace(/[.]\d+/, ''), // remove ms from date format
        temperature: null,
      });
    }
  }

  return dataToFill;
}

/**
 * Forecasting missing data using seasonal and local average
 *
 * @param data
 * @param seasonLength
 * @param seasonalWindow
 * @param localWindow
 * @param localSearchDepth - search depth, taking into account that closest neighbours may have null value
 * @param alpha - coefficient in exponential weight formula
 * @returns {*[]}
 */
function fillSeasonalLocalMovingAverage(
  data,
  seasonLength = 24,
  seasonalWindow = 3,
  localWindow = 2,
  localSearchDepth = 8,
  alpha = 3,
) {
  const result = [...data];

  for (let i = 0; i < data.length; i++) {
    //skip filled values
    if (data[i].temperature !== null) {
      continue;
    }

    const seasonalCandidates = [];
    const localCandidates = [];

    // Collect seasonal data (same hour previous days)
    for (let s = -1; s >= -seasonalWindow; s--) {
      const prevIdx = i + seasonLength * s;
      if (prevIdx >= 0 && data[prevIdx].temperature !== null) {
        seasonalCandidates.push(data[prevIdx].temperature);
      }
    }

    // If no previous seasons, try future seasons
    if (seasonalCandidates.length === 0) {
      for (let s = 1; s <= seasonalWindow; s++) {
        const nextIdx = i + seasonLength * s;
        if (nextIdx < data.length && data[nextIdx].temperature !== null) {
          seasonalCandidates.push(data[nextIdx].temperature);
        }
      }
    }

    // Collect local neighbors backwards
    for (let offset = -1; offset >= -localSearchDepth; offset--) {
      if (localCandidates.length >= localWindow) {
        break;
      }
      const neighborIdx = i + offset;
      if (neighborIdx >= 0 && data[neighborIdx].temperature !== null) {
        localCandidates.push(data[neighborIdx].temperature);
      }
    }

    // Collect local neighbors forwards
    for (let offset = 1; offset <= localSearchDepth; offset++) {
      if (localCandidates.length >= localWindow * 2) {
        break;
      }
      const neighborIdx = i + offset;
      if (neighborIdx < data.length && data[neighborIdx].temperature !== null) {
        localCandidates.push(data[neighborIdx].temperature);
      }
    }

    // Calculate averages
    const seasonalAvg =
      seasonalCandidates.length > 0
        ? seasonalCandidates.reduce((sum, val) => sum + val, 0) / seasonalCandidates.length
        : null;

    const localAvg =
      localCandidates.length > 0 ? localCandidates.reduce((sum, val) => sum + val, 0) / localCandidates.length : null;

    if (seasonalAvg !== null && localAvg !== null) {
      const difference = Math.abs(seasonalAvg - localAvg);
      const seasonalWeight = Math.exp(-alpha * difference);
      result[i].temperature = parseFloat((seasonalAvg * seasonalWeight + localAvg * (1 - seasonalWeight)).toFixed(1));
    } else if (seasonalAvg !== null) {
      result[i].temperature = parseFloat(seasonalAvg.toFixed(1));
    } else if (localAvg !== null) {
      result[i].temperature = parseFloat(localAvg.toFixed(1));
    }
  }

  return result;
}

/**
 * Filling data gaps with forecasted data
 *
 * @param temperatureData
 * @returns {*[]}
 */
export function fillForecastGaps(temperatureData) {
  const dataFilledWithNulls = fillGapsWithNull(temperatureData);

  return fillSeasonalLocalMovingAverage(dataFilledWithNulls);
}
