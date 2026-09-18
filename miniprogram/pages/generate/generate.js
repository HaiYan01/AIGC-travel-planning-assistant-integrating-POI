// pages/generate/generate.js
const api = require('../../utils/api');

Page({
  data: {
    destination: '',
    departureCity: '',
    travelDate: '',
    days: 3,
    budget: '2000',
    requirements: '',
    loading: false,
    minDate: '',
    isPublic: false, // 默认私密
    preferences: [
      { name: '美食', selected: false },
      { name: '历史', selected: false },
      { name: '自然', selected: false },
      { name: '购物', selected: false },
      { name: '打卡', selected: false },
      { name: '亲子', selected: false },
      { name: '休闲', selected: false },
      { name: '户外', selected: false }
    ],
    hotCities: ['杭州', '成都', '北京', '上海', '西安', '厦门', '重庆', '三亚'],
    weatherInfo: null
  },

  onLoad(options) {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    this.setData({ minDate });
    
    // 如果从首页传入城市参数
    if (options.city) {
      this.setData({ destination: options.city });
      if (this.data.travelDate) {
        this.fetchWeather(options.city);
      }
    }
  },

  onDestinationInput(e) {
    this.setData({ destination: e.detail.value });
    if (this.data.travelDate && e.detail.value) {
      this.fetchWeather(e.detail.value);
    }
  },

  onDepartureCityInput(e) {
    this.setData({ departureCity: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ travelDate: e.detail.value });
    if (this.data.destination) {
      this.fetchWeather(this.data.destination);
    }
  },

  onBudgetInput(e) {
    this.setData({ budget: e.detail.value });
  },

  onRequirementsInput(e) {
    this.setData({ requirements: e.detail.value });
  },

  selectDays(e) {
    this.setData({ days: e.currentTarget.dataset.days });
  },

  selectCity(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({ destination: city });
    if (this.data.travelDate) {
      this.fetchWeather(city);
    }
  },

  togglePreference(e) {
    const index = e.currentTarget.dataset.index;
    const preferences = this.data.preferences;
    preferences[index].selected = !preferences[index].selected;
    this.setData({ preferences });
  },

  togglePublic(e) {
    const isPublic = e.currentTarget.dataset.public;
    this.setData({ isPublic: isPublic === true || isPublic === 'true' });
  },

  async fetchWeather(city) {
    try {
      const res = await api.request(`/weather/${city}`);
      this.setData({ weatherInfo: res });
    } catch (error) {
      this.setData({ weatherInfo: null });
    }
  },

  async generatePlan() {
    // 验证必填项
    if (!this.data.destination) {
      wx.showToast({ title: '请输入目的地', icon: 'none' });
      return;
    }

    if (!this.data.travelDate) {
      wx.showToast({ title: '请选择出行日期', icon: 'none' });
      return;
    }

    const selectedPrefs = this.data.preferences
      .filter(p => p.selected)
      .map(p => p.name);

    if (selectedPrefs.length === 0) {
      wx.showToast({ title: '请选择至少一个偏好', icon: 'none' });
      return;
    }

    if (!this.data.budget || parseInt(this.data.budget) < 100) {
      wx.showToast({ title: '预算不能少于100元', icon: 'none' });
      return;
    }

    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再生成行程',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const plan = await api.generatePlan({
        destination: this.data.destination,
        departureCity: this.data.departureCity || null,
        travelDate: this.data.travelDate,
        days: this.data.days,
        budget: parseInt(this.data.budget),
        preferences: selectedPrefs,
        requirements: this.data.requirements,
        isPublic: this.data.isPublic
      });

      wx.navigateTo({
        url: `/pages/plan/plan?id=${plan.planId}`
      });
    } catch (error) {
      wx.showToast({ title: error.message || '生成失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
