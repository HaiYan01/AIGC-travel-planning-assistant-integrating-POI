// pages/login/login.js
const api = require('../../utils/api');

Page({
  data: {
    email: '',
    password: '',
    username: '',
    isRegister: false,
    loading: false
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  toggleMode() {
    this.setData({ isRegister: !this.data.isRegister });
  },

  async handleSubmit() {
    if (!this.data.email || !this.data.password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (this.data.isRegister && !this.data.username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      let result;
      if (this.data.isRegister) {
        result = await api.register({
          username: this.data.username,
          email: this.data.email,
          password: this.data.password
        });
      } else {
        result = await api.login({
          email: this.data.email,
          password: this.data.password
        });
      }

      wx.setStorageSync('token', result.token);
      wx.setStorageSync('userId', result.user.id);
      getApp().globalData.isLoggedIn = true;
      getApp().globalData.userInfo = result.user;

      wx.showToast({ title: this.data.isRegister ? '注册成功' : '登录成功', icon: 'success' });
      
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
