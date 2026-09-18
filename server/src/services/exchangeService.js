import { logger } from '../utils/logger.js';

// 使用免费的汇率API
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest';

// 带超时的 JSON 请求,避免外部 API 挂起
const fetchJson = async (url, timeoutMs = 6000) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  return response.json();
};

// 主要货币
export const currencies = {
  USD: { name: '美元', symbol: '$' },
  EUR: { name: '欧元', symbol: '€' },
  GBP: { name: '英镑', symbol: '£' },
  JPY: { name: '日元', symbol: '¥' },
  KRW: { name: '韩元', symbol: '₩' },
  HKD: { name: '港币', symbol: 'HK$' },
  TWD: { name: '新台币', symbol: 'NT$' },
  SGD: { name: '新加坡元', symbol: 'S$' },
  AUD: { name: '澳元', symbol: 'A$' },
  CAD: { name: '加拿大元', symbol: 'C$' },
  THB: { name: '泰铢', symbol: '฿' },
  MYR: { name: '马来西亚林吉特', symbol: 'RM' },
  CNY: { name: '人民币', symbol: '¥' }
};

// 获取汇率
export const getExchangeRate = async (from = 'CNY', to = 'USD') => {
  try {
    const data = await fetchJson(`${EXCHANGE_API}/${from}`);

    if (!data.rates) {
      throw new Error('获取汇率失败');
    }

    return {
      from,
      to,
      rate: data.rates[to],
      time: data.date
    };
  } catch (error) {
    logger.error('Exchange rate error:', error);
    throw new Error('汇率获取失败');
  }
};

// 获取所有汇率
export const getAllRates = async (base = 'CNY') => {
  try {
    const data = await fetchJson(`${EXCHANGE_API}/${base}`);

    if (!data.rates) {
      throw new Error('获取汇率失败');
    }

    // 只返回主要货币
    const result = {};
    for (const [code, info] of Object.entries(currencies)) {
      if (data.rates[code]) {
        result[code] = {
          ...info,
          rate: data.rates[code]
        };
      }
    }

    return {
      base,
      rates: result,
      time: data.date
    };
  } catch (error) {
    logger.error('Exchange rate error:', error);
    throw new Error('汇率获取失败');
  }
};

// 货币转换
export const convertCurrency = async (amount, from, to) => {
  try {
    const { rate } = await getExchangeRate(from, to);
    return {
      from: { amount, currency: from },
      to: { amount: (amount * rate).toFixed(2), currency: to },
      rate
    };
  } catch (error) {
    throw error;
  }
};
