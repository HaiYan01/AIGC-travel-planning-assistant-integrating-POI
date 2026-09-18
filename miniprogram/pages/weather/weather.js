// pages/weather/weather.js
const api = require('../../utils/api');

Page({
  data: {
    city: '',
    weather: null,
    loading: false,
    searched: false,
    hotCities: ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '厦门']
  },

  onLoad() {
    // 尝试获取当前位置
    this.getLocation();
  },

  getLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        // 使用高德地图逆地理编码获取城市名
        // 这里简化处理，直接使用默认城市
      },
      fail: () => {
        console.log('获取位置失败');
      }
    });
  },

  onCityInput(e) {
    this.setData({ city: e.detail.value });
  },

  selectCity(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({ city });
    this.searchWeather();
  },

  async searchWeather() {
    if (!this.data.city.trim()) {
      wx.showToast({ title: '请输入城市名', icon: 'none' });
      return;
    }

    this.setData({ loading: true, searched: true });

    try {
      const weather = await api.getWeather(this.data.city);
      this.setData({ weather, loading: false });
    } catch (error) {
      this.setData({ loading: false, weather: null });
      wx.showToast({ title: '获取天气失败', icon: 'none' });
    }
  },

  getWeatherIcon(weather) {
    if (!weather) return '🌤️';
    if (weather.includes('雨')) return '🌧️';
    if (weather.includes('雪')) return '❄️';
    if (weather.includes('阴')) return '☁️';
    if (weather.includes('云') || weather.includes('多云')) return '⛅';
    if (weather.includes('晴')) return '☀️';
    if (weather.includes('雾')) return '🌫️';
    if (weather.includes('雷')) return '⛈️';
    return '🌤️';
  }
});
