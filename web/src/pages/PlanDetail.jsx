import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, Row, Col, Tag, Timeline, Divider,
  Button, Space, message, Spin, Tabs, Descriptions, Empty, Alert, Tooltip
} from 'antd';
import {
  EnvironmentOutlined, ClockCircleOutlined, WalletOutlined,
  HeartOutlined, HeartFilled, CopyOutlined, ShareAltOutlined,
  CalendarOutlined, CloudOutlined, SafetyOutlined,
  LinkOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { usePlanStore, useAuthStore } from '../services/store';
import { api } from '../services/http';
import AMap from '../components/AMap';
import scenicSpotsData from '../data/scenic-spots.json';

const { Title, Paragraph, Text } = Typography;

const scenicSpots = scenicSpotsData.scenicSpots;

// 查找景点信息
const findScenicSpot = (name) => {
  if (!name) return null;
  return scenicSpots.find(spot => 
    spot.name === name || 
    spot.aliases?.some(alias => name.includes(alias) || alias.includes(name)) ||
    name.includes(spot.name)
  );
};

const typeColors = {
  attraction: 'blue',
  food: 'orange',
  transport: 'green',
  hotel: 'purple'
};

const typeLabels = {
  attraction: '景点',
  food: '美食',
  transport: '交通',
  hotel: '住宿'
};

const weatherIcons = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '雨': '🌧️',
  '小雨': '🌦️',
  '中雨': '🌧️',
  '大雨': '⛈️',
  '雷阵雨': '⛈️',
  '雪': '❄️',
  '雾': '🌫️'
};

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPlan, fetchPlan, likePlan, copyPlan } = usePlanStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    try {
      const plan = await fetchPlan(id);
      // 如果有出行日期和目的地，获取天气
      if (plan.destination) {
        fetchWeather(plan.destination, plan.travelDate);
      }
    } catch (error) {
      message.error('加载行程失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (city, date) => {
    try {
      const { data } = await api.get(`/weather/${city}`);
      setWeather(data);
    } catch (error) {
      console.error('Weather fetch failed:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    try {
      await likePlan(id);
      loadPlan();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCopy = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    try {
      const newPlan = await copyPlan(id);
      message.success('复制成功，可在"我的行程"中查看');
      navigate(`/plan/${newPlan.id}`);
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('链接已复制到剪贴板');
  };

  const getWeatherIcon = (weatherText) => {
    if (!weatherText) return '🌤️';
    for (const [key, icon] of Object.entries(weatherIcons)) {
      if (weatherText.includes(key)) return icon;
    }
    return '🌤️';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentPlan) {
    return <Empty description="行程不存在" />;
  }

  const { itinerary, user: planUser } = currentPlan;
  const likesCount = currentPlan._count?.likes || 0;
  const isOwner = user && user.id === currentPlan.userId;

  return (
    <div className="container py-8 page-transition">
      {/* Header */}
      <Card bodyStyle={{ padding: '32px' }} className="mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <Title level={2} className="!mb-2">
              <EnvironmentOutlined className="mr-2 text-blue-500" />
              {currentPlan.title}
            </Title>
            <Space size="large" className="text-gray-500" wrap>
              <span><EnvironmentOutlined /> {currentPlan.destination}</span>
              <span><ClockCircleOutlined /> {currentPlan.days}天</span>
              <span><WalletOutlined /> 预算 ¥{currentPlan.budget}</span>
              {/* 出行日期仅对本人显示 */}
              {isOwner && currentPlan.travelDate && (
                <span>
                  <CalendarOutlined /> {new Date(currentPlan.travelDate).toLocaleDateString()}
                </span>
              )}
            </Space>
            <div className="mt-3">
              {currentPlan.preferences?.map((p) => (
                <Tag key={p} color="blue">{p}</Tag>
              ))}
            </div>
          </div>
          <Space>
            <Button
              icon={currentPlan.isLiked ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
              onClick={handleLike}
            >
              {likesCount}
            </Button>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>复制行程</Button>
            <Button icon={<ShareAltOutlined />} onClick={handleShare}>分享</Button>
          </Space>
        </div>

        {itinerary?.summary && (
          <Paragraph className="mt-4 text-gray-600">{itinerary.summary}</Paragraph>
        )}
      </Card>

      {/* 天气信息（仅对本人显示） */}
      {isOwner && weather && (
        <Alert
          className="mb-6"
          message={
            <div className="flex items-center justify-between">
              <span>
                <CloudOutlined className="mr-2" />
                {currentPlan.destination}天气
                {currentPlan.travelDate && (
                  <span className="ml-2 text-gray-500">
                    （出发日：{new Date(currentPlan.travelDate).toLocaleDateString()}）
                  </span>
                )}
              </span>
              <span className="text-lg">
                {weather.realtime && (
                  <>
                    {getWeatherIcon(weather.realtime.weather)} {weather.realtime.weather} {weather.realtime.temperature}°C
                  </>
                )}
              </span>
            </div>
          }
          description={weather.advice}
          type="info"
          showIcon={false}
        />
      )}

      {/* 交通查询（仅对本人显示） */}
      {isOwner && currentPlan.travelDate && (
        <Card bodyStyle={{ padding: '24px' }} className="mb-6">
          <Title level={4}>🚄 交通查询</Title>
          <Paragraph className="text-gray-500 mb-4">
            查询出发和返程的机票/火车票信息
          </Paragraph>
          
          <Row gutter={[16, 16]}>
            {/* 火车票 */}
            <Col xs={24} md={12}>
              <Card size="small" className="h-full">
                <div className="text-center mb-3">
                  <span className="text-2xl">🚄</span>
                  <div className="font-semibold mt-1">火车票/高铁票</div>
                </div>
                <Space direction="vertical" className="w-full">
                  <Button 
                    block 
                    type="primary"
                    onClick={() => {
                      const date = new Date(currentPlan.travelDate).toISOString().split('T')[0];
                      window.open(`https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&ts=${encodeURIComponent(currentPlan.destination)}&date=${date}&flag=N,N,Y`, '_blank');
                    }}
                  >
                    12306 查询去程
                  </Button>
                  <Button 
                    block
                    onClick={() => {
                      const returnDate = new Date(new Date(currentPlan.travelDate).getTime() + (currentPlan.days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      window.open(`https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=${encodeURIComponent(currentPlan.destination)}&date=${returnDate}&flag=N,N,Y`, '_blank');
                    }}
                  >
                    12306 查询返程
                  </Button>
                </Space>
              </Card>
            </Col>
            
            {/* 机票 */}
            <Col xs={24} md={12}>
              <Card size="small" className="h-full">
                <div className="text-center mb-3">
                  <span className="text-2xl">✈️</span>
                  <div className="font-semibold mt-1">机票</div>
                </div>
                <Space direction="vertical" className="w-full">
                  <Button 
                    block 
                    type="primary"
                    onClick={() => {
                      const date = new Date(currentPlan.travelDate).toISOString().split('T')[0];
                      window.open(`https://flights.ctrip.com/online/list/oneway-${currentPlan.destination}?depdate=${date}`, '_blank');
                    }}
                  >
                    携程 查询去程
                  </Button>
                  <Button 
                    block
                    onClick={() => {
                      const returnDate = new Date(new Date(currentPlan.travelDate).getTime() + (currentPlan.days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      window.open(`https://flights.ctrip.com/online/list/oneway-${currentPlan.destination}?depdate=${returnDate}`, '_blank');
                    }}
                  >
                    携程 查询返程
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <Text type="warning" className="text-sm">
              💡 提示：点击按钮将跳转到对应网站查询，票价以实际查询结果为准
            </Text>
          </div>
        </Card>
      )}

      {/* Content */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Tabs
            defaultActiveKey="0"
            items={itinerary?.days?.map((day, index) => ({
              key: String(index),
              label: `第${day.day}天`,
              children: (
                <Card bodyStyle={{ padding: '24px' }}>
                  <Title level={4} className="!mb-1">{day.theme}</Title>
                  <Text type="secondary">预估花费：¥{day.dailyBudget}</Text>
                  <Divider />

                  <Timeline
                    items={day.activities?.map((act) => ({
                      color: typeColors[act.type] || 'blue',
                      children: (
                        <div className="activity-card p-4 rounded-lg mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Tag color={typeColors[act.type]}>
                                {typeLabels[act.type]}
                              </Tag>
                              <span className="ml-2 font-semibold">{act.time}</span>
                            </div>
                            {act.cost && <Text type="secondary">¥{act.cost}</Text>}
                          </div>
                          <Title level={5} className="!mt-2 !mb-1">{act.name}</Title>
                          <Paragraph className="!mb-1 text-gray-600">
                            {act.description}
                          </Paragraph>
                          {act.tips && (
                            <Text type="secondary" className="text-sm">
                              💡 {act.tips}
                            </Text>
                          )}
                          {/* 景点门票预订 - 仅当数据库中有该景点时显示 */}
                          {act.type === 'attraction' && (() => {
                            const spot = findScenicSpot(act.name);
                            if (!spot) return null;
                            return (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <Text strong className="text-sm">
                                    🎫 {spot.name}
                                  </Text>
                                  <Tag color="blue">{spot.level}</Tag>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  <div>📍 {spot.address}</div>
                                  <div>🕐 {spot.openTime}</div>
                                  <div>💰 {spot.ticketPrice}</div>
                                  {spot.ticketNote && <div>📝 {spot.ticketNote}</div>}
                                </div>
                                <Space>
                                  {spot.ticketWebsite && (
                                    <a href={spot.ticketWebsite} target="_blank" rel="noopener noreferrer">
                                      <Button 
                                        type="primary"
                                        size="small"
                                        icon={<LinkOutlined />}
                                      >
                                        预订门票
                                      </Button>
                                    </a>
                                  )}
                                  {spot.officialWebsite && (
                                    <a href={spot.officialWebsite} target="_blank" rel="noopener noreferrer">
                                      <Button size="small">
                                        官方网站
                                      </Button>
                                    </a>
                                  )}
                                </Space>
                              </div>
                            );
                          })()}
                        </div>
                      )
                    }))}
                  />

                  {day.meals && (
                    <>
                      <Divider>美食推荐</Divider>
                      <Row gutter={[16, 16]}>
                        {['breakfast', 'lunch', 'dinner'].map((meal) => {
                          const mealData = day.meals[meal];
                          const mealLabel = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
                          if (!mealData?.name) return null;
                          return (
                            <Col span={8} key={meal}>
                              <Card bodyStyle={{ padding: '16px' }} size="small" className="text-center">
                                <Text type="secondary">{mealLabel[meal]}</Text>
                                <div className="font-semibold mt-1">{mealData.name}</div>
                                <Text className="text-sm">{mealData.recommendation}</Text>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </>
                  )}
                </Card>
              )
            }))}
          />

          {/* Tips */}
          {itinerary?.tips?.length > 0 && (
            <Card bodyStyle={{ padding: '24px' }} className="mt-6">
              <Title level={4}>旅行小贴士</Title>
              <ul className="pl-5">
                {itinerary.tips.map((tip, i) => (
                  <li key={i} className="mb-2 text-gray-600">{tip}</li>
                ))}
              </ul>
            </Card>
          )}
        </Col>

        {/* Map & Info */}
        <Col xs={24} lg={10}>
          <Card bodyStyle={{ padding: '24px' }} className="mb-6">
            <Title level={4}>行程地图</Title>
            <AMap itinerary={itinerary} />
          </Card>

          <Card bodyStyle={{ padding: '24px' }}>
            <Title level={4}>实用信息</Title>
            <Descriptions column={1} size="small">
              {itinerary?.weatherAdvice && (
                <Descriptions.Item label="天气穿衣">
                  {itinerary.weatherAdvice}
                </Descriptions.Item>
              )}
              {itinerary?.transportAdvice && (
                <Descriptions.Item label="交通建议">
                  {itinerary.transportAdvice}
                </Descriptions.Item>
              )}
              {itinerary?.totalBudget && (
                <Descriptions.Item label="预估总花费">
                  {itinerary.totalBudget}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card bodyStyle={{ padding: '24px' }} className="mt-6">
            <Title level={4}>作者信息</Title>
            <div className="flex items-center">
              <div>
                <div className="font-semibold">{planUser?.nickname || planUser?.username}</div>
                <Text type="secondary">
                  发布于 {new Date(currentPlan.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 保险建议 */}
      <Card bodyStyle={{ padding: '24px' }} className="mt-6">
        <Title level={4}>
          <SafetyOutlined className="mr-2 text-green-500" />
          保险建议
        </Title>
        <Paragraph className="text-gray-500 mb-4">
          出行前建议购买合适的保险，为旅途增添一份保障
        </Paragraph>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" className="h-full bg-blue-50">
              <div className="text-center">
                <span className="text-3xl">🏥</span>
                <Title level={5} className="mt-2 mb-1">旅行意外险</Title>
                <Text type="secondary" className="text-xs">
                  覆盖意外伤害、医疗费用、紧急救援等，建议所有旅行者购买
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" className="h-full bg-green-50">
              <div className="text-center">
                <span className="text-3xl">✈️</span>
                <Title level={5} className="mt-2 mb-1">航班延误险</Title>
                <Text type="secondary" className="text-xs">
                  航班延误或取消时可获得赔偿，适合乘坐飞机出行的旅客
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" className="h-full bg-orange-50">
              <div className="text-center">
                <span className="text-3xl">🧳</span>
                <Title level={5} className="mt-2 mb-1">行李丢失险</Title>
                <Text type="secondary" className="text-xs">
                  行李延误、丢失或损坏时可获得赔偿，适合携带贵重物品出行
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Text type="secondary" className="text-sm">
            💡 温馨提示：以上保险信息仅供参考，请根据自身需求选择合适的保险产品。购买前请仔细阅读保险条款。
          </Text>
        </div>
      </Card>
    </div>
  );
}
