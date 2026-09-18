import { logger } from '../utils/logger.js';

const AMAP_KEY = process.env.AMAP_KEY;
const AMAP_BASE_URL = 'https://restapi.amap.com/v3';

// 带超时的 JSON 请求,避免外部 API 挂起
const fetchJson = async (url, timeoutMs = 6000) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  return response.json();
};

// 地理编码：地址转坐标
export const geocode = async (address, city = '') => {
  try {
    const url = `${AMAP_BASE_URL}/geocode/geo?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&key=${AMAP_KEY}&output=JSON`;
    const data = await fetchJson(url);

    if (data.status === '1' && data.geocodes?.length > 0) {
      const [lng, lat] = data.geocodes[0].location.split(',');
      return { longitude: parseFloat(lng), latitude: parseFloat(lat) };
    }
    return null;
  } catch (error) {
    logger.error('Geocode error:', error);
    return null;
  }
};

// POI搜索：更精确的地点搜索
export const searchPOI = async (keyword, city = '') => {
  try {
    const url = `${AMAP_BASE_URL}/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}&citylimit=false&key=${AMAP_KEY}&output=JSON&offset=1&page=1`;
    const data = await fetchJson(url);

    if (data.status === '1' && data.pois?.length > 0) {
      const poi = data.pois[0];
      const [lng, lat] = poi.location.split(',');
      return {
        longitude: parseFloat(lng),
        latitude: parseFloat(lat),
        name: poi.name,
        address: poi.address || poi.pname + poi.cityname + poi.adname + poi.name
      };
    }
    return null;
  } catch (error) {
    logger.error('POI search error:', error);
    return null;
  }
};

// 批量修正行程中的坐标
export const geocodeLocations = async (itinerary, destination) => {
  if (!itinerary?.days) return itinerary;

  const correctedDays = [];

  for (const day of itinerary.days) {
    const correctedActivities = [];

    for (const act of (day.activities || [])) {
      let coords = null;

      // 优先用POI搜索，更精确
      coords = await searchPOI(act.name, destination);

      // 如果POI搜索失败，用地理编码
      if (!coords && act.address) {
        coords = await geocode(act.address, destination);
      }

      if (coords) {
        correctedActivities.push({
          ...act,
          longitude: coords.longitude,
          latitude: coords.latitude
        });
      } else {
        // 保留AI给的坐标作为fallback
        correctedActivities.push(act);
      }

      // 避免请求太快被限制
      await new Promise(r => setTimeout(r, 200));
    }

    correctedDays.push({
      ...day,
      activities: correctedActivities
    });
  }

  return {
    ...itinerary,
    days: correctedDays
  };
};
