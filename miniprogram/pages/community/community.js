// pages/community/community.js
const api = require('../../utils/api');

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
  }
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  // 小于30天
  if (diff < 2592000000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }
  // 超过30天显示日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

Page({
  data: {
    plans: [],
    loading: true,
    page: 1,
    hasMore: true,
    sort: 'newest'
  },

  onLoad() {
    this.loadPlans();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, plans: [], hasMore: true });
    this.loadPlans().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  processPlans(plans) {
    return plans.map(plan => ({
      ...plan,
      createdAt: formatDate(plan.createdAt),
      avatarInitial: plan.user ? (plan.user.nickname || plan.user.username || '?').charAt(0) : '?',
      authorName: plan.user ? (plan.user.nickname || plan.user.username) : '匿名用户'
    }));
  },

  async loadPlans() {
    this.setData({ loading: true });
    try {
      const result = await api.getCommunityPlans({
        page: 1,
        limit: 10,
        sort: this.data.sort
      });
      this.setData({
        plans: this.processPlans(result.data),
        hasMore: result.data.length >= 10,
        loading: false
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async loadMore() {
    const nextPage = this.data.page + 1;
    try {
      const result = await api.getCommunityPlans({
        page: nextPage,
        limit: 10,
        sort: this.data.sort
      });
      this.setData({
        plans: [...this.data.plans, ...this.processPlans(result.data)],
        page: nextPage,
        hasMore: result.data.length >= 10
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  changeSort(e) {
    this.setData({ sort: e.currentTarget.dataset.sort });
    this.loadPlans();
  },

  goToPlan(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/plan/plan?id=${id}` });
  }
});
