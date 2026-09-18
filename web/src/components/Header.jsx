import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Drawer, message, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  CompassOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  LogoutOutlined,
  LoginOutlined,
  LockOutlined,
  CloudOutlined,
  DollarOutlined,
  MenuOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../services/store';
import { api } from '../services/http';

const { Header: AntHeader } = Layout;

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 需要登录的导航
  const handleProtectedNav = async (path, closeDrawer = true) => {
    if (!user) {
      message.warning('请先登录后再使用此功能');
      navigate('/login', { state: { from: path } });
      return;
    }
    
    // ClawBot需要检查权限
    if (path === '/claw') {
      try {
        const response = await api.get('/ai/claw/permission');
        if (!response.data.hasPermission) {
          message.error('您暂无权限使用ClawBot，请联系管理员开通');
          return;
        }
      } catch (error) {
        message.error('权限检查失败，请稍后重试');
        return;
      }
    }
    
    if (closeDrawer) {
      setDrawerOpen(false);
    }
    navigate(path);
  };

  // 菜单项点击:整个菜单项可点(而不只是文字)
  const handleMenuClick = ({ key }) => {
    if (key === '/generate' || key === '/claw') {
      handleProtectedNav(key);
      return;
    }
    setDrawerOpen(false);
    navigate(key);
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/generate', icon: <CompassOutlined />, label: '生成行程' },
    { key: '/community', icon: <TeamOutlined />, label: '攻略社区' },
    { key: '/weather', icon: <CloudOutlined />, label: '天气' },
    { key: '/exchange', icon: <DollarOutlined />, label: '汇率' },
    { key: '/claw', icon: <RobotOutlined />, label: <span>ClawBot <Tag color="blue" style={{ fontSize: '10px', marginLeft: 4 }}>百度AI</Tag></span> }
  ];

  // 移动端只显示图标的菜单
  const iconOnlyMenuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/" /> },
    { key: '/generate', icon: <CompassOutlined />, label: <span onClick={() => handleProtectedNav('/generate', false)} style={{ cursor: 'pointer' }} /> },
    { key: '/community', icon: <TeamOutlined />, label: <Link to="/community" /> },
    { key: '/weather', icon: <CloudOutlined />, label: <Link to="/weather" /> },
    { key: '/exchange', icon: <DollarOutlined />, label: <Link to="/exchange" /> },
    { key: '/claw', icon: <RobotOutlined />, label: <span onClick={() => handleProtectedNav('/claw', false)} style={{ cursor: 'pointer' }} /> }
  ];

  const userMenuItems = [
    { key: 'my-plans', icon: <UserOutlined />, label: '我的行程', onClick: () => { navigate('/my-plans'); setDrawerOpen(false); } },
    { key: 'chat', icon: <MessageOutlined />, label: 'AI助手', onClick: () => { navigate('/chat'); setDrawerOpen(false); } },
  ];

  if (user?.role === 'admin') {
    userMenuItems.push({ key: 'admin', icon: <LockOutlined />, label: '管理后台', onClick: () => { navigate('/admin'); setDrawerOpen(false); } });
  }

  userMenuItems.push({ type: 'divider' });
  userMenuItems.push({ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => { logout(); setDrawerOpen(false); } });

  return (
    <>
      <AntHeader className="flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 h-16 leading-16">
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center mr-4 md:mr-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
              <CompassOutlined className="text-lg text-white" />
            </div>
            <span className="text-lg font-bold text-dark ml-3 whitespace-nowrap hidden sm:inline">AI旅行助手</span>
          </Link>
          {!isMobile && (
            <Menu 
              mode="horizontal" 
              items={menuItems} 
              onClick={handleMenuClick}
              className="border-0 bg-transparent"
              style={{ background: 'transparent' }}
            />
          )}
        </div>

        <Space>
          {user ? (
            <>
              {!isMobile && (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Button type="text" className="flex items-center h-10">
                    <Avatar 
                      src={user.avatar} 
                      icon={<UserOutlined />} 
                      className="mr-2"
                      size="small"
                    />
                    <span className="text-dark">{user.nickname || user.username}</span>
                    {user.role === 'admin' && <LockOutlined className="ml-1 text-red-500 text-xs" />}
                  </Button>
                </Dropdown>
              )}
              {isMobile && (
                <Button 
                  type="text" 
                  icon={<MenuOutlined />} 
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center"
                />
              )}
            </>
          ) : (
            <>
              {!isMobile && (
                <Space>
                  <Button 
                    icon={<LoginOutlined />} 
                    onClick={() => navigate('/login')}
                  >
                    登录
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/register')}
                  >
                    注册
                  </Button>
                </Space>
              )}
              {isMobile && (
                <Button 
                  type="text" 
                  icon={<MenuOutlined />} 
                  onClick={() => setDrawerOpen(true)}
                />
              )}
            </>
          )}
        </Space>
      </AntHeader>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title={
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md mr-3">
              <CompassOutlined className="text-lg text-white" />
            </div>
            <span className="text-lg font-bold text-dark">AI旅行助手</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
      >
        {user && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <Avatar 
                src={user.avatar} 
                icon={<UserOutlined />} 
                size="large"
                className="mr-3"
              />
              <div>
                <div className="font-semibold">{user.nickname || user.username}</div>
                <div className="text-gray-500 text-sm">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <Menu
          mode="vertical"
          items={menuItems}
          onClick={handleMenuClick}
          className="border-0"
        />

        {user && (
          <>
            <div className="my-4 border-t border-gray-100" />
            <Menu
              mode="vertical"
              items={userMenuItems}
              className="border-0"
            />
          </>
        )}

        {!user && (
          <>
            <div className="my-4 border-t border-gray-100" />
            <Space direction="vertical" className="w-full">
              <Button 
                block
                icon={<LoginOutlined />} 
                onClick={() => { navigate('/login'); setDrawerOpen(false); }}
              >
                登录
              </Button>
              <Button 
                block
                type="primary" 
                onClick={() => { navigate('/register'); setDrawerOpen(false); }}
              >
                注册
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </>
  );
}
