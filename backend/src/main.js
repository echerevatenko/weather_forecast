import express from 'express';
import cors from 'cors';
import { ApiRequestException } from './exceptions/api-request-exception.js';
import { fetchWeatherData } from './services/data-fetch-service.js';
import { cleanData } from './services/data-cleaning-service.js';
import { fillForecastGaps } from './services/data-forecast-service.js';
import { filterTemperatureData } from './services/filter-service.js';
import { RequestFormatException } from './exceptions/request-format-exception.js';

const app = express();
app.use(cors());
const port = 3000;

app.get('/temperature', async (req, res) => {
  let result = {};

  try {
    const weatherData = await fetchWeatherData(req.query.city);

    const temperatureData = cleanData(weatherData);

    const date = new Date(req.query.day);
    date.setHours(req.query.time);

    if (date < new Date(temperatureData[0].time) || date > new Date(temperatureData[temperatureData.length - 1].time)) {
      throw new RequestFormatException('Requested day/time is out of forecast range');
    }

    const forecastData = fillForecastGaps(temperatureData);

    result = { temperature: filterTemperatureData(forecastData, req.query.day, req.query.time) };

    res.json({ status: 200, result: result });
  } catch (err) {
    console.log(err);
    if (err instanceof ApiRequestException) {
      res.statusCode = 502;
      res.json({ message: err.message });
    } else if (err instanceof RequestFormatException) {
      res.statusCode = 400;
      res.json({ message: err.message });
    } else {
      res.statusCode = 500;
      res.json({ message: 'Server error' });
    }
  }
});

app.listen(port, () => {});
