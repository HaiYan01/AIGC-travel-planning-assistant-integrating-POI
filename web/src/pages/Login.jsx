import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, MailOutlined, CompassOutlined } from '@ant-design/icons';
import { useAuthStore } from '../services/store';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  
  // 获取登录后要跳转的页面
  const from = location.state?.from || '/';

  const onFinish = async (values) => {
    try {
      await login(values.email, values.password);
      message.success('登录成功');
      navigate(from);
    } catch (error) {
      message.error(error.response?.data?.error || '登录失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md liquid-card" bodyStyle={{ padding: '40px' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CompassOutlined className="text-3xl text-white" />
          </div>
          <Title level={3} className="!mb-2">欢迎回来</Title>
          <Text type="secondary">登录账号，继续规划你的旅程</Text>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效邮箱' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="邮箱" 
              className="liquid-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="密码"
              className="liquid-input"
            />
          </Form.Item>

          <Form.Item className="!mb-4">
            <Button 
              type="primary"
              htmlType="submit" 
              block 
              loading={loading}
              className="h-12 rounded-xl text-base w-full"
            >
              登录
            </Button>
          </Form.Item>

          <div className="text-center text-gray-500">
            还没有账号？{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700">
              立即注册
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
