// pages/claw/claw.js
Page({
  data: {
    messages: [],
    inputText: '',
    loading: false,
    mode: 'chat'
  },

  onLoad() {
    // 页面加载
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendMessage() {
    const { inputText, messages, loading } = this.data;
    if (!inputText.trim() || loading) return;

    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再使用此功能',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
      return;
    }

    const userMsg = { role: 'user', content: inputText };
    this.setData({ 
      messages: [...messages, userMsg],
      inputText: '',
      loading: true
    });

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${getApp().globalData.baseUrl}/ai/mimo-claw`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            messages: [...this.data.messages, userMsg],
            mode: this.data.mode
          },
          success: (res) => {
            if (res.statusCode === 403) {
              reject(new Error('PERMISSION_DENIED'));
            } else if (res.statusCode === 200) {
              resolve(res.data);
            } else {
              reject(new Error(res.data?.error || '请求失败'));
            }
          },
          fail: reject
        });
      });

      const assistantMsg = { 
        role: 'assistant', 
        content: response.message || '抱歉，我没有收到有效回复。' 
      };
      this.setData({ 
        messages: [...this.data.messages, assistantMsg]
      });
    } catch (error) {
      console.error('Claw error:', error);
      let errorMsg = '抱歉，发生了错误，请稍后重试。';
      
      if (error.message === 'PERMISSION_DENIED') {
        errorMsg = '抱歉，您暂无权限使用此功能。请在网页版申请开通ClawBot权限。';
      }
      
      this.setData({ 
        messages: [...this.data.messages, { role: 'assistant', content: errorMsg }]
      });
    } finally {
      this.setData({ loading: false });
      this.scrollToBottom();
    }
  },

  setMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode });
  },

  quickAction(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputText: text });
  },

  clearChat() {
    wx.showModal({
      title: '提示',
      content: '确定要清空对话吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
        }
      }
    });
  },

  scrollToBottom() {
    // 滚动到底部
    setTimeout(() => {
      this.setData({ scrollIntoView: `msg-${this.data.messages.length - 1}` });
    }, 100);
  },

  onShareAppMessage() {
    return {
      title: 'ClawBot - AI旅行助手',
      path: '/pages/claw/claw'
    };
  }
});
