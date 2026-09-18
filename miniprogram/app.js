App({
  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.isLoggedIn = true;
      this.getUserInfo();
    }
  },

  globalData: {
    isLoggedIn: false,
    userInfo: null,
    token: null,
    baseUrl: 'https://wanghaiyan.cn/api'
  },

  getUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    wx.request({
      url: `${this.globalData.baseUrl}/auth/me`,
      header: { Authorization: `Bearer ${token}` },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.userInfo = res.data;
        }
      }
    });
  }
});
