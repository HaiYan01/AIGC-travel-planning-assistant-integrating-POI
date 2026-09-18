import axios from 'axios';

// 统一 API 实例:自动附带 token、默认超时、401 统一处理
export const api = axios.create({ baseURL: '/api', timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let lastAuthEvent = 0;
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // 登录/注册接口的 401 属于业务失败(密码错误等),由页面自行提示
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      const now = Date.now();
      if (now - lastAuthEvent > 2000) {
        lastAuthEvent = now;
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
