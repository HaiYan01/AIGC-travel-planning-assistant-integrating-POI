import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, message } from 'antd';
import { useAuthStore } from './services/store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PlanGenerator from './pages/PlanGenerator';
import PlanDetail from './pages/PlanDetail';
import MyPlans from './pages/MyPlans';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import AIChat from './pages/AIChat';
import MimoClaw from './pages/MimoClaw';
import Admin from './pages/admin/Admin';
import Weather from './pages/weather/Weather';
import Exchange from './pages/exchange/Exchange';

const { Content, Footer } = Layout;

function App() {
  const { token, fetchUser, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  // 会话过期(任意接口 401)统一处理
  useEffect(() => {
    const onUnauthorized = () => {
      logout();
      message.warning('登录已过期，请重新登录');
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [logout, navigate]);

  return (
    <Layout className="min-h-screen relative">
      <Header />
      <Content className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={token ? <PlanGenerator /> : <Navigate to="/login" state={{ from: '/generate' }} />} />
          <Route path="/plan/:id" element={<PlanDetail />} />
          <Route path="/my-plans" element={token ? <MyPlans /> : <Navigate to="/login" state={{ from: '/my-plans' }} />} />
          <Route path="/community" element={<Community />} />
          <Route path="/chat" element={token ? <AIChat /> : <Navigate to="/login" state={{ from: '/chat' }} />} />
          <Route path="/claw" element={token ? <MimoClaw /> : <Navigate to="/login" state={{ from: '/claw' }} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" state={{ from: '/admin' }} />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/exchange" element={<Exchange />} />
        </Routes>
      </Content>
      <Footer className="text-center relative z-10 text-sm">
        <div>AI旅行规划助手 ©2026 让AI为你规划完美旅程 | 开发者：汪海岩</div>
        <div className="mt-2">
          <a 
            href="https://beian.miit.gov.cn/#/Integrated/index" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700"
          >
            京ICP备2025140074号-2
          </a>
        </div>
      </Footer>
    </Layout>
  );
}

export default App;
