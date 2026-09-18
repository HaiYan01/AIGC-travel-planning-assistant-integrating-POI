import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, InputNumber, Select, Button, Card, Typography,
  Spin, Steps, message, Tag, Row, Col, DatePicker, Alert
} from 'antd';
import {
  CompassOutlined, AimOutlined, WalletOutlined, CalendarOutlined,
  LoadingOutlined, CheckCircleOutlined, CloudOutlined
} from '@ant-design/icons';
import { usePlanStore, useAuthStore } from '../services/store';
import { api } from '../services/http';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const preferenceOptions = [
  { label: '美食探店', value: '美食' },
  { label: '历史文化', value: '历史' },
  { label: '自然风光', value: '自然' },
  { label: '购物娱乐', value: '购物' },
  { label: '网红打卡', value: '打卡' },
  { label: '亲子游', value: '亲子' },
  { label: '休闲度假', value: '休闲' },
  { label: '户外探险', value: '户外' }
];

const popularDestinations = [
  '杭州', '成都', '北京', '上海', '西安',
  '厦门', '重庆', '苏州', '三亚', '丽江'
];

export default function PlanGenerator() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { generatePlan, loading } = usePlanStore();
  const { token } = useAuthStore();
  const [travelDate, setTravelDate] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // 当目的地和日期改变时查询天气
  useEffect(() => {
    const destination = form.getFieldValue('destination');
    if (destination && travelDate) {
      fetchWeatherForecast(destination, travelDate);
    }
  }, [travelDate]);

  const fetchWeatherForecast = async (city, date) => {
    setWeatherLoading(true);
    try {
      const { data } = await api.get(`/weather/${city}`);
      setWeatherForecast(data);
    } catch (error) {
      setWeatherForecast(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const onFinish = async (values) => {
    if (!token) {
      message.warning('请先登录后再生成行程');
      navigate('/login');
      return;
    }

    try {
      const plan = await generatePlan({
        ...values,
        travelDate: travelDate ? travelDate.format('YYYY-MM-DD') : null
      });
      message.success('行程生成成功！');
      navigate(`/plan/${plan.planId}`);
    } catch (error) {
      message.error(error.response?.data?.error || '生成失败，请重试');
    }
  };

  const disabledDate = (current) => {
    // 不能选择过去的日期
    return current && current < dayjs().startOf('day');
  };

  // 获取指定日期的天气预报
  const getWeatherForDate = (date) => {
    if (!weatherForecast?.forecast || !date) return null;
    const dateStr = date.format('YYYY-MM-DD');
    return weatherForecast.forecast.find(f => f.date === dateStr);
  };

  const selectedWeather = travelDate ? getWeatherForDate(travelDate) : null;

  return (
    <div className="container py-16 mt-4 page-transition">
      <Row gutter={[48, 48]} align="middle">
        <Col xs={24} lg={14}>
          <Card bodyStyle={{ padding: '32px' }}>
            <Title level={3} className="!mb-2">
              <CompassOutlined className="mr-2" />
              AI行程规划
            </Title>
            <Paragraph className="text-gray-500 mb-6">
              告诉我们你的旅行需求，AI将为你生成专属行程方案
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ days: 3, budget: 2000, preferences: [] }}
            >
              <Form.Item
                name="destination"
                label="目的地"
                rules={[{ required: true, message: '请输入目的地' }]}
              >
                <Input
                  prefix={<AimOutlined />}
                  placeholder="例如：杭州"
                  size="large"
                  onBlur={(e) => {
                    if (travelDate && e.target.value) {
                      fetchWeatherForecast(e.target.value, travelDate);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name="departureCity"
                label="出发城市"
                tooltip="可选，用于查询交通信息"
              >
                <Input
                  prefix={<AimOutlined />}
                  placeholder="例如：北京（选填）"
                  size="large"
                />
              </Form.Item>

              <div className="mb-4">
                <span className="text-gray-500 text-sm">热门目的地：</span>
                {popularDestinations.map((city) => (
                  <Tag
                    key={city}
                    className="cursor-pointer mb-1"
                    onClick={() => {
                      form.setFieldsValue({ destination: city });
                      if (travelDate) {
                        fetchWeatherForecast(city, travelDate);
                      }
                    }}
                  >
                    {city}
                  </Tag>
                ))}
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="travelDate"
                    label="出行日期"
                    rules={[{ required: true, message: '请选择出行日期' }]}
                    tooltip="出行日期仅自己可见，不会在社区公开展示"
                  >
                    <DatePicker
                      size="large"
                      className="w-full"
                      placeholder="选择出发日期"
                      disabledDate={disabledDate}
                      onChange={(date) => setTravelDate(date)}
                      prefix={<CalendarOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="days"
                    label="旅行天数"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={1}
                      max={30}
                      size="large"
                      className="w-full"
                      addonAfter="天"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    name="budget"
                    label="预算"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={100}
                      size="large"
                      className="w-full"
                      prefix={<WalletOutlined />}
                      addonAfter="元"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 天气预报提示 */}
              {travelDate && (
                <Alert
                  className="mb-4"
                  message={
                    <div className="flex items-center justify-between">
                      <span>
                        <CloudOutlined className="mr-2" />
                        出发日天气预报
                      </span>
                      {weatherLoading ? (
                        <Spin size="small" />
                      ) : selectedWeather ? (
                        <span>
                          {selectedWeather.dayweather} {selectedWeather.daytemp}°C / {selectedWeather.nighttemp}°C
                        </span>
                      ) : weatherForecast?.realtime ? (
                        <span>当前：{weatherForecast.realtime.weather} {weatherForecast.realtime.temperature}°C</span>
                      ) : (
                        <span>查询天气中...</span>
                      )}
                    </div>
                  }
                  description={
                    selectedWeather ? (
                      <span>
                        {selectedWeather.dayweather.includes('雨') && '记得带伞，'}
                        {parseInt(selectedWeather.daytemp) > 25 ? '天气较热，注意防晒' : 
                         parseInt(selectedWeather.daytemp) < 15 ? '天气较凉，注意保暖' : '天气舒适，适合出行'}
                      </span>
                    ) : weatherForecast?.advice ? (
                      <span>{weatherForecast.advice}</span>
                    ) : null
                  }
                  type="info"
                  showIcon={false}
                />
              )}

              <Form.Item
                name="preferences"
                label="旅行偏好"
                rules={[{ required: true, message: '请至少选择一个偏好' }]}
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="选择你喜欢的旅行方式"
                  options={preferenceOptions}
                />
              </Form.Item>

              <Form.Item name="requirements" label="其他要求">
                <TextArea
                  rows={3}
                  placeholder="例如：我想去西湖看日落，想吃正宗的龙井虾仁..."
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  icon={loading ? <LoadingOutlined /> : <CheckCircleOutlined />}
                >
                  {loading ? 'AI正在为你规划中...' : '生成行程方案'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card bodyStyle={{ padding: '24px' }}>
            <Title level={4}>生成流程</Title>
            <Steps
              direction="vertical"
              current={loading ? 1 : 0}
              items={[
                {
                  title: '输入需求',
                  description: '填写目的地、日期、天数、预算和偏好'
                },
                {
                  title: 'AI智能分析',
                  description: '大模型分析并生成最佳行程方案'
                },
                {
                  title: '天气匹配',
                  description: '根据出行日期匹配天气信息'
                },
                {
                  title: '地图可视化',
                  description: '景点自动标记，路线清晰展示'
                }
              ]}
            />
          </Card>

          {loading && (
            <Card bodyStyle={{ padding: '24px' }} className="mt-6 text-center">
              <Spin size="large" />
              <Paragraph className="mt-4 text-gray-500">
                AI正在为你精心规划行程，预计需要10-30秒...
              </Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
