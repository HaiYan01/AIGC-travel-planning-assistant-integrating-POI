import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// 隐藏加载动画
const hideLoading = () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('fade-out');
    setTimeout(() => {
      loading.remove();
    }, 500);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#3b82f6' } }}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// 应用加载完成后隐藏加载动画
setTimeout(hideLoading, 100);
