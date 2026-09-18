import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, Table, Button, Tag, Space, message, Spin,
  Popconfirm, Modal, Input, Form, Select, Tabs, Statistic, Row, Col
} from 'antd';
import {
  UserOutlined, FileTextOutlined, EnvironmentOutlined,
  DeleteOutlined, EyeOutlined, EditOutlined, LockOutlined,
  TeamOutlined, GlobalOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../services/store';
import { api } from '../../services/http';

const { Title } = Typography;

export default function Admin() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 等待 /auth/me 返回,避免刚进页面 user 为 null 被误判无权限
    if (!token || !user) return;
    if (user.role !== 'admin') {
      message.error('需要管理员权限');
      navigate('/');
      return;
    }
    loadData();
  }, [user, token, navigate]);

  if (!token || !user) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const loadData = async () => {
    try {
      const [usersRes, plansRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/plans'),
        api.get('/admin/stats')
      ]);
      setUsers(usersRes.data);
      setPlans(plansRes.data);
      setStats(statsRes.data);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const deletePlan = async (id) => {
    try {
      await api.delete(`/admin/plans/${id}`);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const togglePlanPublic = async (id, isPublic) => {
    try {
      await api.put(`/admin/plans/${id}`, { isPublic: !isPublic });
      message.success('更新成功');
      loadData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const userColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '角色', dataIndex: 'role', render: (r) => <Tag color={r === 'admin' ? 'red' : 'blue'}>{r}</Tag> },
    { title: '行程数', dataIndex: ['_count', 'travelPlans'] },
    { title: '注册时间', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString() },
    {
      title: '操作',
      render: (_, record) => (
        <Popconfirm title="确定删除此用户？" onConfirm={() => deleteUser(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      )
    }
  ];

  const planColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '目的地', dataIndex: 'destination' },
    { title: '天数', dataIndex: 'days' },
    { title: '作者', dataIndex: ['user', 'username'] },
    { title: '浏览', dataIndex: 'viewCount' },
    { title: '点赞', dataIndex: ['_count', 'likes'] },
    {
      title: '状态', dataIndex: 'isPublic',
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? '公开' : '私密'}</Tag>
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/plan/${record.id}`)}>查看</Button>
          <Button type="link" onClick={() => togglePlanPublic(record.id, record.isPublic)}>
            {record.isPublic ? '设为私密' : '设为公开'}
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => deletePlan(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const items = [
    {
      key: 'stats',
      label: '数据概览',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card><Statistic title="总用户" value={stats.totalUsers} prefix={<TeamOutlined />} /></Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card><Statistic title="总行程" value={stats.totalPlans} prefix={<FileTextOutlined />} /></Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card><Statistic title="公开行程" value={stats.publicPlans} prefix={<GlobalOutlined />} /></Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card><Statistic title="总景点" value={stats.totalAttractions} prefix={<EnvironmentOutlined />} /></Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'users',
      label: '用户管理',
      children: <Table columns={userColumns} dataSource={users} rowKey="id" loading={loading} scroll={{ x: 800 }} />
    },
    {
      key: 'plans',
      label: '行程管理',
      children: <Table columns={planColumns} dataSource={plans} rowKey="id" loading={loading} scroll={{ x: 1000 }} />
    }
  ];

  return (
    <div className="container py-8" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Title level={3}>
        <LockOutlined className="mr-2" />
        管理后台
      </Title>
      <Card bodyStyle={{ padding: '24px' }}>
        <Tabs items={items} />
      </Card>
    </div>
  );
}
