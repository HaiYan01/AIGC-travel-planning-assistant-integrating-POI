// pages/exchange/exchange.js
const api = require('../../utils/api');

Page({
  data: {
    amount: '',
    fromCurrency: 'CNY',
    toCurrency: 'USD',
    result: null,
    loading: false,
    currencies: [
      { code: 'CNY', name: '人民币', symbol: '¥' },
      { code: 'USD', name: '美元', symbol: '$' },
      { code: 'EUR', name: '欧元', symbol: '€' },
      { code: 'GBP', name: '英镑', symbol: '£' },
      { code: 'JPY', name: '日元', symbol: '¥' },
      { code: 'KRW', name: '韩元', symbol: '₩' },
      { code: 'HKD', name: '港币', symbol: 'HK$' },
      { code: 'TWD', name: '新台币', symbol: 'NT$' },
      { code: 'SGD', name: '新加坡元', symbol: 'S$' },
      { code: 'THB', name: '泰铢', symbol: '฿' },
      { code: 'AUD', name: '澳元', symbol: 'A$' },
      { code: 'CAD', name: '加元', symbol: 'C$' }
    ],
    fromIndex: 0,
    toIndex: 1,
    rates: null
  },

  onLoad() {
    this.loadRates();
  },

  async loadRates() {
    try {
      const rates = await api.getExchangeRates('CNY');
      this.setData({ rates });
    } catch (error) {
      console.error('获取汇率失败', error);
    }
  },

  onAmountInput(e) {
    this.setData({ amount: e.detail.value });
    this.calculateResult();
  },

  onFromChange(e) {
    this.setData({ fromCurrency: this.data.currencies[e.detail.value].code, fromIndex: e.detail.value });
    this.calculateResult();
  },

  onToChange(e) {
    this.setData({ toCurrency: this.data.currencies[e.detail.value].code, toIndex: e.detail.value });
    this.calculateResult();
  },

  swapCurrencies() {
    const { fromCurrency, toCurrency, fromIndex, toIndex } = this.data;
    this.setData({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency,
      fromIndex: toIndex,
      toIndex: fromIndex
    });
    this.calculateResult();
  },

  async calculateResult() {
    const { amount, fromCurrency, toCurrency } = this.data;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      this.setData({ result: null });
      return;
    }

    if (fromCurrency === toCurrency) {
      this.setData({
        result: {
          amount: parseFloat(amount),
          rate: 1,
          converted: parseFloat(amount)
        }
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await api.convertCurrency({
        amount: parseFloat(amount),
        from: fromCurrency,
        to: toCurrency
      });
      // 处理后端返回的数据格式
      const converted = res.to ? parseFloat(res.to.amount) : (res.converted || 0);
      const rate = res.rate || 1;
      this.setData({ 
        result: { 
          converted, 
          rate,
          from: res.from,
          to: res.to
        }, 
        loading: false 
      });
    } catch (error) {
      console.error('汇率转换失败', error);
      this.setData({ loading: false, result: null });
      wx.showToast({ title: '转换失败，请检查网络', icon: 'none' });
    }
  },

  copyResult() {
    if (this.data.result) {
      const text = `${this.data.amount} ${this.data.fromCurrency} = ${this.data.result.converted} ${this.data.toCurrency}`;
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' });
        }
      });
    }
  }
});
