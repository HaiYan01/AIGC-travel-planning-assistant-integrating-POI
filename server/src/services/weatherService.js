import { logger } from '../utils/logger.js';

const AMAP_KEY = process.env.AMAP_KEY;

// 带超时的 JSON 请求,避免外部 API 挂起拖慢整个请求
const fetchJson = async (url, timeoutMs = 6000) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  return response.json();
};

// 获取城市天气
export const getWeather = async (city) => {
  try {
    // 先获取城市编码
    const geoUrl = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(city)}&key=${AMAP_KEY}`;
    const geoData = await fetchJson(geoUrl);

    if (geoData.status !== '1' || !geoData.geocodes?.length) {
      throw new Error('城市未找到');
    }

    const adcode = geoData.geocodes[0].adcode;

    // 获取实时天气
    const liveUrl = `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${AMAP_KEY}&extensions=base`;
    const liveData = await fetchJson(liveUrl);

    // 获取天气预报
    const forecastUrl = `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${AMAP_KEY}&extensions=all`;
    const forecastData = await fetchJson(forecastUrl);
    
    // 格式化返回数据
    const result = {
      city: city,
      realtime: null,
      forecast: []
    };
    
    // 实时天气
    if (liveData.status === '1' && liveData.lives?.length) {
      const live = liveData.lives[0];
      result.realtime = {
        temperature: live.temperature,
        weather: live.weather,
        winddirection: live.winddirection,
        windpower: live.windpower,
        humidity: live.humidity,
        reporttime: live.reporttime
      };
    }
    
    // 天气预报
    if (forecastData.status === '1' && forecastData.forecasts?.length) {
      result.forecast = forecastData.forecasts[0].casts.map(cast => ({
        date: cast.date,
        dayweather: cast.dayweather,
        nightweather: cast.nightweather,
        daytemp: cast.daytemp,
        nighttemp: cast.nighttemp,
        daywind: cast.daywind,
        nightwind: cast.nightwind
      }));
    }
    
    return result;
  } catch (error) {
    logger.error('Weather API error:', error);
    throw new Error('天气信息获取失败');
  }
};

// 获取穿衣建议
export const getWeatherAdvice = (weather, temp) => {
  const tempNum = parseInt(temp);
  let advice = '';
  
  if (tempNum <= 0) {
    advice = '天气寒冷，建议穿羽绒服、棉服，注意保暖';
  } else if (tempNum <= 10) {
    advice = '天气较冷，建议穿大衣、毛衣，可带围巾';
  } else if (tempNum <= 20) {
    advice = '天气舒适，建议穿夹克、卫衣，早晚注意加衣';
  } else if (tempNum <= 28) {
    advice = '天气温暖，建议穿短袖、薄外套';
  } else {
    advice = '天气炎热，建议穿短袖、短裤，注意防晒';
  }
  
  if (weather?.includes('雨')) {
    advice += '，记得带伞';
  }
  if (weather?.includes('雪')) {
    advice += '，注意防滑';
  }
  
  return advice;
};
