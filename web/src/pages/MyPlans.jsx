import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, Row, Col, Tag, Button, Empty, Spin,
  Popconfirm, message, Space, Switch, Modal
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined,
  EnvironmentOutlined, ClockCircleOutlined, WalletOutlined,
  GlobalOutlined, LockOutlined
} from '@ant-design/icons';
import { usePlanStore } from '../services/store';

const { Title, Paragraph } = Typography;

export default function MyPlans() {
  const navigate = useNavigate();
  const { myPlans, fetchMyPlans, deletePlan, updatePlan } = usePlanStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      await fetchMyPlans();
    } catch (error) {
      message.error('加载行程失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlan(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleTogglePublic = async (plan) => {
    try {
      await updatePlan(plan.id, { isPublic: !plan.isPublic });
      message.success(plan.isPublic ? '已设为私密' : '已公开分享');
      loadPlans();
    } catch (error) {
      message.error('操作失败');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container py-8 page-transition">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">我的行程</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/generate')}
        >
          创建新行程
        </Button>
      </div>

      {myPlans.length === 0 ? (
        <Empty
          description="还没有行程"
          className="py-20"
        >
          <Button type="primary" onClick={() => navigate('/generate')}>
            立即创建第一个行程
          </Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {myPlans.map((plan) => (
            <Col xs={24} sm={12} lg={8} key={plan.id}>
              <Card
                className="card-shadow h-full hover:shadow-lg transition-shadow"
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/plan/${plan.id}`)}
                  >
                    查看
                  </Button>,
                  <Button
                    type="text"
                    icon={plan.isPublic ? <GlobalOutlined /> : <LockOutlined />}
                    onClick={() => handleTogglePublic(plan)}
                  >
                    {plan.isPublic ? '公开' : '私密'}
                  </Button>,
                  <Popconfirm
                    title="确定删除这个行程？"
                    onConfirm={() => handleDelete(plan.id)}
                    okText="删除"
                    okType="danger"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                ]}
              >
                <div className="cursor-pointer" onClick={() => navigate(`/plan/${plan.id}`)}>
                  <Title level={4} className="!mb-2 line-clamp-1">{plan.title}</Title>
                  <Space size="small" className="text-gray-500 mb-3 block">
                    <span><EnvironmentOutlined /> {plan.destination}</span>
                    <span><ClockCircleOutlined /> {plan.days}天</span>
                    <span><WalletOutlined /> ¥{plan.budget}</span>
                  </Space>
                  <div className="flex justify-between items-center text-gray-400 text-sm">
                    <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                    <Space>
                      <span>👁 {plan.viewCount}</span>
                      <span>❤ {plan._count?.likes || 0}</span>
                      <span>📋 {plan.copyCount}</span>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
