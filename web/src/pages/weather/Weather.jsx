import { useState } from 'react';
import {
  Typography, Card, Input, Button, Row, Col, Spin, Empty, Tag, Space
} from 'antd';
import {
  SearchOutlined, CloudOutlined, SunOutlined, 
  ThunderboltOutlined, HomeOutlined
} from '@ant-design/icons';
import { api } from '../../services/http';

const { Title, Text, Paragraph } = Typography;

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
  '小雪': '🌨️',
  '雾': '🌫️',
  '霾': '😷'
};

export default function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchWeather = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/weather/${city}`);
      setWeather(data);
    } catch (error) {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherText) => {
    for (const [key, icon] of Object.entries(weatherIcons)) {
      if (weatherText?.includes(key)) return icon;
    }
    return '🌤️';
  };

  return (
    <div className="container py-8 page-transition">
      <Title level={3} className="!mb-6">
        <CloudOutlined className="mr-2" />
        天气查询
      </Title>

      <Card className="liquid-card mb-6" bodyStyle={{ padding: '24px' }}>
        <Space.Compact className="w-full">
          <Input
            size="large"
            placeholder="输入城市名，如：杭州"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onPressEnter={searchWeather}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={searchWeather}
            loading={loading}
          >
            查询
          </Button>
        </Space.Compact>
      </Card>

      {loading && (
        <div className="text-center py-16">
          <Spin size="large" />
        </div>
      )}

      {weather && !loading && (
        <>
          {/* 实时天气 */}
          <Card className="liquid-card mb-6" bodyStyle={{ padding: '32px' }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={12}>
                <div className="text-center md:text-left">
                  <Title level={2} className="!mb-2">
                    {weather.city}
                  </Title>
                  <div className="text-6xl mb-4">
                    {getWeatherIcon(weather.realtime?.weather)}
                  </div>
                  <Text className="text-5xl font-bold text-dark">
                    {weather.realtime?.temperature}°C
                  </Text>
                  <Paragraph className="text-xl text-dark-secondary mt-2">
                    {weather.realtime?.weather}
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 rounded-lg bg-white/50">
                    <Text className="text-dark-secondary">风向</Text>
                    <Text className="text-dark">{weather.realtime?.winddirection}</Text>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/50">
                    <Text className="text-dark-secondary">风力</Text>
                    <Text className="text-dark">{weather.realtime?.windpower}级</Text>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-white/50">
                    <Text className="text-dark-secondary">湿度</Text>
                    <Text className="text-dark">{weather.realtime?.humidity}%</Text>
                  </div>
                  {weather.advice && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <Text className="text-blue-600">
                        👕 {weather.advice}
                      </Text>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>

          {/* 天气预报 */}
          <Card className="liquid-card" bodyStyle={{ padding: '24px' }}>
            <Title level={4} className="!mb-4">未来天气</Title>
            <Row gutter={[16, 16]}>
              {weather.forecast?.map((day, i) => (
                <Col xs={12} sm={8} md={6} lg={4} key={i}>
                  <div className="text-center p-4 rounded-xl bg-white/50">
                    <Text className="text-dark-secondary block mb-2">
                      {new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </Text>
                    <div className="text-3xl mb-2">
                      {getWeatherIcon(day.dayweather)}
                    </div>
                    <Text className="text-dark block">
                      {day.daytemp}° / {day.nighttemp}°
                    </Text>
                    <Text className="text-dark-secondary text-xs">
                      {day.dayweather}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </>
      )}

      {!weather && !loading && (
        <Card className="liquid-card" bodyStyle={{ padding: '60px' }}>
          <Empty description="输入城市名查询天气" />
        </Card>
      )}
    </div>
  );
}
