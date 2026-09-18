// pages/chat/chat.js
const api = require('../../utils/api');

Page({
  data: {
    messages: [],
    inputText: '',
    loading: false,
    scrollTop: 0
  },

  onLoad() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录使用AI助手',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendMessage() {
    if (!this.data.inputText.trim() || this.data.loading) return;

    const userMessage = this.data.inputText.trim();
    const messages = [...this.data.messages, { role: 'user', content: userMessage }];
    
    this.setData({ 
      messages, 
      inputText: '', 
      loading: true 
    });

    this.scrollToBottom();

    try {
      const result = await api.chat({ messages });
      
      this.setData({
        messages: [...this.data.messages, { role: 'assistant', content: result.message }],
        loading: false
      });

      this.scrollToBottom();
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '发送失败', icon: 'none' });
    }
  },

  scrollToBottom() {
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.message-list').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          this.setData({ scrollTop: res[0].height });
        }
      });
    }, 100);
  },

  clearChat() {
    wx.showModal({
      title: '提示',
      content: '确定清空对话？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
        }
      }
    });
  },

  quickQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputText: question });
    this.sendMessage();
  }
});
