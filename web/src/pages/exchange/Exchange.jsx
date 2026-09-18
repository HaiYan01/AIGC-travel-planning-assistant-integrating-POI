import { useState, useEffect } from 'react';
import {
  Typography, Card, Input, Select, Button, Row, Col, Spin, Table, Space, message
} from 'antd';
import { SwapOutlined, DollarOutlined } from '@ant-design/icons';
import { api } from '../../services/http';

const { Title, Text } = Typography;

export default function Exchange() {
  const [currencies, setCurrencies] = useState({});
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('CNY');
  const [to, setTo] = useState('USD');
  const [result, setResult] = useState(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
    loadRates();
  }, []);

  const loadCurrencies = async () => {
    try {
      const { data } = await api.get('/exchange/currencies');
      setCurrencies(data);
    } catch (error) {
      console.error(error);
      message.error('加载货币列表失败');
    }
  };

  const loadRates = async () => {
    setRatesLoading(true);
    try {
      const { data } = await api.get('/exchange/rates/CNY');
      setRates(data);
    } catch (error) {
      console.error(error);
      message.error('加载汇率失败，请稍后重试');
    } finally {
      setRatesLoading(false);
    }
  };

  const convert = async () => {
    if (!amount || isNaN(amount)) {
      message.warning('请输入有效金额');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/exchange/convert', {
        amount: parseFloat(amount),
        from,
        to
      });
      setResult(data);
    } catch (error) {
      console.error(error);
      message.error('转换失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  const columns = [
    {
      title: '货币',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <Space>
          <span className="font-semibold">{code}</span>
          <span className="text-gray-500">{currencies[code]?.name}</span>
        </Space>
      )
    },
    {
      title: '符号',
      dataIndex: 'symbol',
      key: 'symbol'
    },
    {
      title: '汇率 (1 CNY =)',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate) => rate?.toFixed(4)
    }
  ];

  const tableData = rates ? Object.entries(rates.rates).map(([code, info]) => ({
    key: code,
    code,
    ...info
  })) : [];

  return (
    <div className="container py-8 page-transition">
      <Title level={3} className="!mb-6">
        <DollarOutlined className="mr-2" />
        汇率转换
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card className="liquid-card" bodyStyle={{ padding: '32px' }}>
            <Title level={4} className="!mb-6">货币换算</Title>
            
            <div className="mb-4">
              <Text className="block mb-2 text-dark-secondary">金额</Text>
              <Input
                size="large"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="输入金额"
              />
            </div>

            <Row gutter={16} align="middle" className="mb-6">
              <Col flex="1">
                <Text className="block mb-2 text-dark-secondary">从</Text>
                <Select
                  size="large"
                  value={from}
                  onChange={setFrom}
                  className="w-full"
                  options={Object.entries(currencies).map(([code, info]) => ({
                    value: code,
                    label: `${code} - ${info.name}`
                  }))}
                />
              </Col>
              <Col>
                <Button
                  icon={<SwapOutlined />}
                  onClick={swapCurrencies}
                  className="mt-6"
                />
              </Col>
              <Col flex="1">
                <Text className="block mb-2 text-dark-secondary">到</Text>
                <Select
                  size="large"
                  value={to}
                  onChange={setTo}
                  className="w-full"
                  options={Object.entries(currencies).map(([code, info]) => ({
                    value: code,
                    label: `${code} - ${info.name}`
                  }))}
                />
              </Col>
            </Row>

            <Button
              type="primary"
              size="large"
              block
              onClick={convert}
              loading={loading}
            >
              转换
            </Button>

            {result && (
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-center">
                <Text className="text-dark-secondary block mb-2">
                  {currencies[result.from.currency]?.symbol}{result.from.amount} {result.from.currency}
                </Text>
                <div className="text-4xl font-bold gradient-text mb-2">
                  = {currencies[result.to.currency]?.symbol}{result.to.amount}
                </div>
                <Text className="text-dark-secondary">
                  1 {result.from.currency} = {result.rate} {result.to.currency}
                </Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="liquid-card" bodyStyle={{ padding: '24px' }}>
            <Title level={4} className="!mb-4">主要货币汇率</Title>
            <Text className="block mb-4 text-dark-secondary">
              基准货币：人民币 (CNY)
            </Text>
            {ratesLoading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="small"
                scroll={{ x: true }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
