import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, Row, Col, Tag, Input, Select, Spin,
  Empty, Space, Avatar, message
} from 'antd';
import {
  SearchOutlined, EnvironmentOutlined, EyeOutlined,
  HeartOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { usePlanStore } from '../services/store';

const { Title, Paragraph } = Typography;
const { Search } = Input;

export default function Community() {
  const navigate = useNavigate();
  const { communityPlans, fetchCommunityPlans } = usePlanStore();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ destination: '', sort: 'newest' });

  useEffect(() => {
    loadPlans();
  }, [filters]);

  const loadPlans = async () => {
    try {
      await fetchCommunityPlans(filters);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 page-transition">
      <Title level={3} className="!mb-6">
        <HeartOutlined className="mr-2 text-red-500" />
        攻略社区
      </Title>

      {/* Filters */}
      <Card className="card-shadow mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索目的地"
              allowClear
              onSearch={(val) => setFilters({ ...filters, destination: val })}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={filters.sort}
              onChange={(val) => setFilters({ ...filters, sort: val })}
              className="w-full"
              options={[
                { label: '最新发布', value: 'newest' },
                { label: '最多浏览', value: 'popular' },
                { label: '最多点赞', value: 'mostLiked' }
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : communityPlans.length === 0 ? (
        <Empty description="暂无公开行程" className="py-20" />
      ) : (
        <Row gutter={[24, 24]}>
          {communityPlans.map((plan) => (
            <Col xs={24} sm={12} lg={8} key={plan.id}>
              <Card
                className="card-shadow h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/plan/${plan.id}`)}
              >
                <div className="flex items-center mb-3">
                  <Avatar src={plan.user?.avatar} size="small" className="mr-2" />
                  <span className="text-gray-600 text-sm">
                    {plan.user?.nickname || plan.user?.username}
                  </span>
                </div>

                <Title level={4} className="!mb-2 line-clamp-2">{plan.title}</Title>

                <Space size="small" className="text-gray-500 mb-3 block">
                  <span><EnvironmentOutlined /> {plan.destination}</span>
                  <span><ClockCircleOutlined /> {plan.days}天</span>
                </Space>

                <div className="mb-3">
                  {plan.preferences?.slice(0, 3).map((p) => (
                    <Tag key={p} className="mb-1">{p}</Tag>
                  ))}
                </div>

                <div className="flex justify-between items-center text-gray-400 text-sm border-t pt-3">
                  <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  <Space>
                    <span><EyeOutlined /> {plan.viewCount}</span>
                    <span><HeartOutlined /> {plan._count?.likes || 0}</span>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
