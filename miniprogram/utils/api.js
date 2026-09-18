const request = (url, options = {}) => {
  const baseUrl = getApp().globalData.baseUrl;
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${baseUrl}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userId');
          getApp().globalData.isLoggedIn = false;
          getApp().globalData.userInfo = null;
          wx.navigateTo({ url: '/pages/login/login' });
          reject(new Error('请先登录'));
        } else {
          reject(new Error(res.data?.error || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
};

module.exports = {
  // 通用请求方法
  request,

  // Auth
  login: (data) => request('/auth/login', { method: 'POST', data }),
  register: (data) => request('/auth/register', { method: 'POST', data }),
  getUserInfo: () => request('/auth/me'),

  // Plans
  generatePlan: (data) => request('/plans/generate', { method: 'POST', data }),
  getMyPlans: () => request('/plans/my'),
  getPlanDetail: (id) => request(`/plans/${id}`),
  updatePlan: (id, data) => request(`/plans/${id}`, { method: 'PUT', data }),
  deletePlan: (id) => request(`/plans/${id}`, { method: 'DELETE' }),
  copyPlan: (id) => request(`/plans/${id}/copy`, { method: 'POST' }),

  // Community
  getCommunityPlans: (params) => request('/community/plans', { data: params }),
  likePlan: (id) => request(`/community/plans/${id}/like`, { method: 'POST' }),

  // AI Chat
  chat: (data) => request('/ai/chat', { method: 'POST', data }),

  // Weather
  getWeather: (city) => request(`/weather/${city}`),

  // Exchange
  getCurrencies: () => request('/exchange/currencies'),
  getExchangeRate: (from, to) => request(`/exchange/rate/${from}/${to}`),
  getExchangeRates: (base) => request(`/exchange/rates/${base}`),
  convertCurrency: (data) => request('/exchange/convert', { method: 'POST', data }),

  // Attractions
  searchAttractions: (params) => request('/attractions/search', { data: params }),
  getAttractionDetail: (id) => request(`/attractions/${id}`)
};
