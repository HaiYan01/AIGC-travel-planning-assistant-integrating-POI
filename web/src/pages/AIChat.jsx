import { useState, useRef, useEffect } from 'react';
import {
  Typography, Card, Input, Button, Spin, Avatar, Tag, List, Drawer
} from 'antd';
import {
  RobotOutlined, UserOutlined, SendOutlined, ClearOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useChatStore, usePlanStore } from '../services/store';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function AIChat() {
  const { messages, loading, sendMessageWithHistory, clearMessages } = useChatStore();
  const { myPlans, fetchMyPlans } = usePlanStore();
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMyPlans().catch(() => {});
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    try {
      await sendMessageWithHistory(msg);
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: '总结所有行程', action: () => sendMessageWithHistory('请总结我所有的旅行历史') },
    { label: '推荐新目的地', action: () => sendMessageWithHistory('根据我的旅行历史推荐目的地') },
    { label: '行程对比分析', action: () => sendMessageWithHistory('对比分析我的不同行程') },
    { label: '统计报告', action: () => sendMessageWithHistory('生成旅行统计报告') }
  ];

  const stats = {
    totalTrips: myPlans.length,
    totalDays: myPlans.reduce((sum, p) => sum + p.days, 0),
    totalBudget: myPlans.reduce((sum, p) => sum + p.budget, 0),
    destinations: [...new Set(myPlans.map(p => p.destination))]
  };

  // 欢迎界面
  const welcomeContent = (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[400px]">
      <RobotOutlined className="text-5xl text-gray-300 mb-4" />
      <Paragraph className="text-gray-500 mb-2 text-lg">你好！我是你的AI旅行助手</Paragraph>
      <Paragraph className="text-gray-400 mb-6 text-center max-w-md px-4">
        我可以帮你总结旅行历史、分析行程、推荐目的地
        <br />
        {myPlans.length > 0 ? `你已经有 ${myPlans.length} 条行程记录` : '生成一些行程后，我就能为你提供个性化分析了'}
      </Paragraph>
      <div className="w-full max-w-lg px-4">
        <div className="text-sm text-gray-400 mb-3">试试这些问题：</div>
        <div className="space-y-2">
          {['总结一下我的旅行历史', '推荐几个适合我的新目的地', '帮我做一份旅行花费报告'].map((s, i) => (
            <Button key={i} block onClick={() => setInput(s)} disabled={myPlans.length === 0}>{s}</Button>
          ))}
        </div>
      </div>
    </div>
  );

  // 消息列表
  const messagesList = (
    <div className="space-y-4 max-w-4xl mx-auto">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <Avatar
              icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              className={msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}
            />
            <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
            </div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="flex gap-3">
            <Avatar icon={<RobotOutlined />} className="bg-green-500" />
            <div className="p-3 rounded-lg bg-gray-100">
              <Spin size="small" />
              <span className="ml-2 text-gray-500 text-sm">思考中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 移动端抽屉内容
  const drawerContent = (
    <>
      <Card title="我的旅行统计" size="small" className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xl font-bold text-blue-600">{stats.totalTrips}</div>
            <div className="text-xs text-gray-500">行程</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-xl font-bold text-green-600">{stats.totalDays}</div>
            <div className="text-xs text-gray-500">天数</div>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <div className="text-xl font-bold text-orange-600">¥{stats.totalBudget}</div>
            <div className="text-xs text-gray-500">预算</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-xl font-bold text-purple-600">{stats.destinations.length}</div>
            <div className="text-xs text-gray-500">目的地</div>
          </div>
        </div>
      </Card>
      <Card title="AI分析" size="small" className="mb-4">
        <div className="space-y-2">
          {quickActions.map((item, i) => (
            <Button key={i} block onClick={() => { item.action(); setDrawerOpen(false); }} disabled={loading || myPlans.length === 0}>
              {item.label}
            </Button>
          ))}
        </div>
      </Card>
      <Card title="最近行程" size="small" className="mb-4">
        <List size="small" dataSource={myPlans.slice(0, 3)} renderItem={plan => (
          <List.Item className="!px-0 !py-1">
            <div className="w-full">
              <div className="font-medium text-sm truncate">{plan.title}</div>
              <div className="flex gap-2 text-xs text-gray-400">
                <span>{plan.destination}</span>
                <span>{plan.days}天</span>
              </div>
            </div>
          </List.Item>
        )} locale={{ empty: '暂无行程' }} />
      </Card>
      {messages.length > 0 && (
        <Button block icon={<ClearOutlined />} onClick={() => { clearMessages(); setDrawerOpen(false); }}>清空对话</Button>
      )}
    </>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col page-transition">
      {/* 移动端顶部栏 */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-b bg-white">
        <Title level={5} className="!mb-0">
          <RobotOutlined className="mr-2 text-blue-500" /> AI旅行助手
        </Title>
        <Button icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} size="small">功能</Button>
      </div>

      {/* 桌面端头部 */}
      <div className="hidden md:flex px-4 py-3 border-b bg-white justify-between items-center">
        <Title level={4} className="!mb-0">
          <RobotOutlined className="mr-2 text-blue-500" /> AI旅行助手
        </Title>
        {messages.length > 0 && <Button icon={<ClearOutlined />} onClick={clearMessages} size="small">清空</Button>}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 桌面端左侧面板 */}
        <div className="hidden md:block w-64 lg:w-72 flex-shrink-0 p-4 overflow-y-auto bg-gray-50 border-r">
          <Card title="我的旅行统计" size="small" className="mb-4">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xl font-bold text-blue-600">{stats.totalTrips}</div>
                <div className="text-xs text-gray-500">行程</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xl font-bold text-green-600">{stats.totalDays}</div>
                <div className="text-xs text-gray-500">天数</div>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <div className="text-xl font-bold text-orange-600">¥{stats.totalBudget}</div>
                <div className="text-xs text-gray-500">预算</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="text-xl font-bold text-purple-600">{stats.destinations.length}</div>
                <div className="text-xs text-gray-500">目的地</div>
              </div>
            </div>
          </Card>
          <Card title="AI分析" size="small" className="mb-4">
            <div className="space-y-2">
              {quickActions.map((item, i) => (
                <Button key={i} block size="small" onClick={item.action} disabled={loading || myPlans.length === 0}>
                  {item.label}
                </Button>
              ))}
            </div>
          </Card>
          <Card title="最近行程" size="small">
            <List size="small" dataSource={myPlans.slice(0, 3)} renderItem={plan => (
              <List.Item className="!px-0 !py-1">
                <div className="w-full">
                  <div className="font-medium text-sm truncate">{plan.title}</div>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>{plan.destination}</span>
                    <span>{plan.days}天</span>
                  </div>
                </div>
              </List.Item>
            )} locale={{ empty: '暂无行程' }} />
          </Card>
        </div>

        {/* 右侧聊天区 */}
        <div className="flex-1 flex flex-col">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-white">
            {messages.length === 0 ? welcomeContent : messagesList}
          </div>
          
          {/* 输入区域 */}
          <div className="px-4 py-3 border-t bg-white flex-shrink-0">
            <div className="max-w-4xl mx-auto flex gap-2">
              <TextArea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="问我关于你的旅行历史..." autoSize={{ minRows: 1, maxRows: 3 }} className="flex-1" />
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} disabled={!input.trim()}>发送</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端抽屉 */}
      <Drawer title="AI旅行助手" placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen} width={280}>
        {drawerContent}
      </Drawer>
    </div>
  );
}
