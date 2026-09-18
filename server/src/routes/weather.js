import { Router } from 'express';
import { getWeather, getWeatherAdvice } from '../services/weatherService.js';

const router = Router();

// 获取城市天气
router.get('/:city', async (req, res, next) => {
  try {
    const { city } = req.params;
    const weather = await getWeather(city);
    
    // 添加穿衣建议
    if (weather.realtime) {
      weather.advice = getWeatherAdvice(
        weather.realtime.weather,
        weather.realtime.temperature
      );
    }
    
    res.json(weather);
  } catch (error) {
    next(error);
  }
});

export default router;
