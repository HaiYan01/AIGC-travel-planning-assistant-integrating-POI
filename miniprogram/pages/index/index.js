// 首页
Page({
  data: {
    destination: '',
    days: 3,
    budget: '2000',
    loading: false,
    preferences: [
      { name: '美食', selected: false },
      { name: '历史', selected: false },
      { name: '自然', selected: false },
      { name: '购物', selected: false },
      { name: '打卡', selected: false },
      { name: '亲子', selected: false }
    ],
    hotCities: ['杭州', '成都', '北京', '上海', '西安', '厦门']
  },

  onLoad() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      // 可以选择是否强制登录
    }
  },

  onDestinationInput(e) {
    this.setData({ destination: e.detail.value });
  },

  onBudgetInput(e) {
    this.setData({ budget: e.detail.value });
  },

  selectDays(e) {
    this.setData({ days: e.currentTarget.dataset.days });
  },

  selectCity(e) {
    const city = e.currentTarget.dataset.city;
    wx.navigateTo({ url: `/pages/generate/generate?city=${city}` });
  },

  togglePreference(e) {
    const index = e.currentTarget.dataset.index;
    const preferences = this.data.preferences;
    preferences[index].selected = !preferences[index].selected;
    this.setData({ preferences });
  },

  goToGenerate() {
    wx.navigateTo({ url: '/pages/generate/generate' });
  },

  goToCommunity() {
    wx.switchTab({ url: '/pages/community/community' });
  },

  goToWeather() {
    wx.navigateTo({ url: '/pages/weather/weather' });
  },

  goToExchange() {
    wx.navigateTo({ url: '/pages/exchange/exchange' });
  },

  goToChat() {
    wx.switchTab({ url: '/pages/chat/chat' });
  },

  goToMy() {
    wx.switchTab({ url: '/pages/my/my' });
  }
});
