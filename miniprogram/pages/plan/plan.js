// pages/plan/plan.js
const api = require('../../utils/api');

// 景点数据库 - 使用 try-catch 处理加载失败
let scenicSpots = [];
try {
  const data = require('../../data/scenic-spots.json');
  scenicSpots = data.scenicSpots || [];
} catch (e) {
  console.warn('景点数据加载失败，使用空数组', e);
  scenicSpots = [];
}

// 查找景点信息
function findScenicSpot(name) {
  if (!name || scenicSpots.length === 0) return null;
  return scenicSpots.find(spot => 
    spot.name === name || 
    (spot.aliases && spot.aliases.some(alias => name.includes(alias) || alias.includes(name))) ||
    name.includes(spot.name)
  );
}

Page({
  data: {
    plan: null,
    loading: true,
    selectedDay: 0,
    isOwner: false,
    weather: null
  },

  onLoad(options) {
    if (options.id) {
      this.loadPlan(options.id);
    }
  },

  async loadPlan(id) {
    try {
      const plan = await api.getPlanDetail(id);
      const userId = wx.getStorageSync('userId');
      const isOwner = plan.userId === userId;
      
      this.setData({ 
        plan, 
        isOwner,
        loading: false 
      });

      // 如果是作者且有行程，获取天气
      if (isOwner && plan.destination) {
        this.fetchWeather(plan.destination);
      }

      // 处理景点门票信息
      this.processAttractionTickets();
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  async fetchWeather(city) {
    try {
      const weather = await api.getWeather(city);
      this.setData({ weather });
    } catch (error) {
      console.error('获取天气失败', error);
    }
  },

  processAttractionTickets() {
    if (!this.data.plan?.itinerary?.days) return;
    
    const plan = this.data.plan;
    plan.itinerary.days.forEach(day => {
      if (day.activities) {
        day.activities.forEach(act => {
          if (act.type === 'attraction') {
            const spot = findScenicSpot(act.name);
            act.ticketInfo = spot || null;
          }
        });
      }
    });
    this.setData({ plan });
  },

  selectDay(e) {
    this.setData({ selectedDay: e.currentTarget.dataset.index });
  },

  async handleLike() {
    if (!this.data.plan) return;
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    try {
      await api.likePlan(this.data.plan.id);
      this.loadPlan(this.data.plan.id);
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async handleCopy() {
    if (!this.data.plan) return;
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    try {
      const newPlan = await api.copyPlan(this.data.plan.id);
      wx.showToast({ title: '复制成功', icon: 'success' });
      wx.navigateTo({ url: `/pages/plan/plan?id=${newPlan.id}` });
    } catch (error) {
      wx.showToast({ title: '复制失败', icon: 'none' });
    }
  },

  async togglePublic() {
    if (!this.data.plan || !this.data.isOwner) return;
    
    const newStatus = !this.data.plan.isPublic;
    const statusText = newStatus ? '公开' : '私密';
    
    wx.showModal({
      title: '隐私设置',
      content: `确定要将此行程设为${statusText}吗？${newStatus ? '公开后所有人可见' : '设为私密后仅自己可见'}`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.updatePlan(this.data.plan.id, { isPublic: newStatus });
            this.setData({ 'plan.isPublic': newStatus });
            wx.showToast({ title: `已设为${statusText}`, icon: 'success' });
          } catch (error) {
            wx.showToast({ title: '设置失败', icon: 'none' });
          }
        }
      }
    });
  },

  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    if (!this.data.plan) return {};
    return {
      title: this.data.plan.title,
      path: `/pages/plan/plan?id=${this.data.plan.id}`
    };
  },

  // 交通查询
  openTrainSearch() {
    const { plan } = this.data;
    if (!plan?.travelDate) return;
    
    const date = plan.travelDate.split('T')[0];
    const url = `https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&ts=${encodeURIComponent(plan.destination)}&date=${date}&flag=N,N,Y`;
    
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none' });
      }
    });
  },

  openFlightSearch() {
    const { plan } = this.data;
    if (!plan?.travelDate) return;
    
    const date = plan.travelDate.split('T')[0];
    const url = `https://flights.ctrip.com/online/list/oneway-${plan.destination}?depdate=${date}`;
    
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none' });
      }
    });
  },

  // 景点门票预订
  openTicketBooking(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none' });
        }
      });
    }
  },

  // 导航
  openNavigation(e) {
    const { lng, lat, name } = e.currentTarget.dataset;
    const amapWebUrl = `https://uri.amap.com/navigation?to=${lng},${lat},${name}&mode=car`;

    wx.showActionSheet({
      itemList: ['复制导航链接', '打开地图'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: amapWebUrl,
            success: () => {
              wx.showToast({ title: '链接已复制', icon: 'none' });
            }
          });
        } else {
          wx.openLocation({
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            name: name,
            scale: 18
          });
        }
      }
    });
  }
});
