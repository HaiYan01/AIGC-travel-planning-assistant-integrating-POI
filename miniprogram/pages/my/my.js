// pages/my/my.js
const api = require('../../utils/api');

Page({
  data: {
    userInfo: null,
    plans: [],
    loading: true
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
  },

  checkLogin() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.loadUserData();
    } else {
      this.setData({ loading: false });
    }
  },

  async loadUserData() {
    try {
      const [userInfo, plans] = await Promise.all([
        api.getUserInfo(),
        api.getMyPlans()
      ]);
      this.setData({ userInfo, plans, loading: false });
    } catch (error) {
      this.setData({ loading: false });
    }
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goToPlan(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/plan/plan?id=${id}` });
  },

  goToGenerate() {
    wx.navigateTo({ url: '/pages/generate/generate' });
  },

  deletePlan(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个行程吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deletePlan(id);
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadUserData();
          } catch (error) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userId');
          getApp().globalData.isLoggedIn = false;
          getApp().globalData.userInfo = null;
          this.setData({ userInfo: null, plans: [] });
        }
      }
    });
  }
});
