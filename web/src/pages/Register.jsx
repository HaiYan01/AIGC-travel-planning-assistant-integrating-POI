import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CompassOutlined } from '@ant-design/icons';
import { useAuthStore } from '../services/store';

const { Title, Text } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();

  const onFinish = async (values) => {
    try {
      await register(values.username, values.email, values.password);
      message.success('注册成功');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.error || '注册失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md liquid-card" bodyStyle={{ padding: '40px' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CompassOutlined className="text-3xl text-white" />
          </div>
          <Title level={3} className="!mb-2">创建账号</Title>
          <Text type="secondary">开始你的旅行规划之旅</Text>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="用户名"
              className="liquid-input"
            />
          </Form.Item>

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
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="密码"
              className="liquid-input"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码不一致'));
                }
              })
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="确认密码"
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
              注册
            </Button>
          </Form.Item>

          <div className="text-center text-gray-500">
            已有账号？{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
              立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
