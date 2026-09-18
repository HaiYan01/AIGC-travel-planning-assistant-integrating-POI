import { useState, useRef } from 'react';
import {
  Typography, Card, Input, Button, Space, Spin, Avatar, message, Tag, Drawer
} from 'antd';
import {
  RobotOutlined, SendOutlined, ClearOutlined,
  FileTextOutlined, ThunderboltOutlined, BulbOutlined, MenuOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../services/store';
import { api } from '../services/http';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function MimoClaw() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!user) {
      message.warning('请先登录');
      return;
    }

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/mimo-claw', {
        messages: [...messages, userMsg],
        mode: mode
      }, { timeout: 200000 });

      let reply = response.data.message;
      if (typeof reply === 'object') reply = JSON.stringify(reply);
      if (!reply) reply = '抱歉，我没有收到有效回复。';
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Claw error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.response?.data?.error || '抱歉，发生了错误，请稍后重试。' 
      }]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearMessages = () => setMessages([]);

  const renderMessageContent = (content, isUser) => {
    if (isUser) {
      return <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>;
    }
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer"
           className="text-blue-500 hover:text-blue-700 underline">{match[1]}</a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(<span key={lastIndex}>{content.slice(lastIndex)}</span>);
    }
    return <div className="whitespace-pre-wrap text-sm leading-relaxed">{parts.length > 0 ? parts : content}</div>;
  };

  const quickActions = [
    { icon: <BulbOutlined />, title: '行程建议', desc: '分析你的旅行计划', action: () => { setInput('请分析我的旅行计划并提供优化建议'); setMode('analyze'); } },
    { icon: <FileTextOutlined />, title: '攻略总结', desc: '快速获取要点', action: () => { setInput('请帮我总结以下游记的要点：'); setMode('analyze'); } },
    { icon: <ThunderboltOutlined />, title: '智能规划', desc: 'AI帮你规划', action: () => { setInput('我想去'); setMode('chat'); } }
  ];

  // 欢迎界面
  const welcomeContent = (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[400px]">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 md:mb-6">
        <RobotOutlined className="text-3xl md:text-4xl text-white" />
      </div>
      <Paragraph className="text-gray-500 mb-2 text-lg font-medium">你好！我是 ClawBot</Paragraph>
      <Paragraph className="text-gray-400 mb-4 text-center max-w-md px-4">
        基于百度AI的智能旅行助手<br />支持联网搜索，为你提供最新的旅行信息
      </Paragraph>
      <Space className="mb-6 md:mb-8">
        <Tag color="blue">百度AI</Tag>
        <Tag color="green">联网搜索</Tag>
        <Tag color="orange">深度分析</Tag>
      </Space>
      <div className="w-full max-w-lg px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {quickActions.map((item, i) => (
            <Button key={i} onClick={item.action} className="h-auto py-3 text-left">
              <div className="flex items-start gap-2">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              </div>
            </Button>
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
              icon={msg.role === 'user' ? null : <RobotOutlined />}
              className={msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-500 to-blue-600'}
              style={msg.role === 'user' ? {} : { color: 'white' }}
            >
              {msg.role === 'user' ? user?.nickname?.[0] || 'U' : null}
            </Avatar>
            <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {renderMessageContent(msg.content, msg.role === 'user')}
            </div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="flex gap-3">
            <Avatar icon={<RobotOutlined />} className="bg-gradient-to-br from-blue-500 to-blue-600" />
            <div className="p-3 rounded-lg bg-gray-100">
              <Spin size="small" />
              <span className="ml-2 text-gray-500 text-sm">思考中...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  // 移动端抽屉内容
  const drawerContent = (
    <>
      <Card title="功能模式" size="small" className="mb-4">
        <Space direction="vertical" className="w-full">
          <Button block type={mode === 'chat' ? 'primary' : 'default'} onClick={() => { setMode('chat'); setDrawerOpen(false); }}>
            💬 智能对话
          </Button>
          <Button block type={mode === 'analyze' ? 'primary' : 'default'} onClick={() => { setMode('analyze'); setDrawerOpen(false); }}>
            🔍 深度分析
          </Button>
        </Space>
      </Card>
      <Card title="快捷功能" size="small" className="mb-4">
        <Space direction="vertical" className="w-full">
          {quickActions.map((item, i) => (
            <Button key={i} block onClick={() => { item.action(); setDrawerOpen(false); }}>
              <div className="flex items-center">
                <span className="mr-2">{item.icon}</span>
                <span>{item.title}</span>
              </div>
            </Button>
          ))}
        </Space>
      </Card>
      {messages.length > 0 && (
        <Button block icon={<ClearOutlined />} onClick={() => { clearMessages(); setDrawerOpen(false); }}>
          清空对话
        </Button>
      )}
    </>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col page-transition">
      {/* 移动端顶部栏 */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-b bg-white">
        <Title level={5} className="!mb-0">
          <RobotOutlined className="mr-2 text-blue-600" /> ClawBot
          <Tag color="blue" className="ml-2">百度AI</Tag>
        </Title>
        <Button icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} size="small">功能</Button>
      </div>

      {/* 桌面端头部 */}
      <div className="hidden md:flex px-4 py-3 border-b bg-white justify-between items-center">
        <Title level={4} className="!mb-0">
          <RobotOutlined className="mr-2 text-blue-600" /> ClawBot
          <Tag color="blue" className="ml-2">百度AI</Tag>
        </Title>
        {messages.length > 0 && <Button icon={<ClearOutlined />} onClick={clearMessages} size="small">清空</Button>}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 桌面端左侧面板 */}
        <div className="hidden md:block w-72 flex-shrink-0 p-4 overflow-y-auto bg-gray-50 border-r">
          <Card title={<span><RobotOutlined className="mr-2 text-blue-600" />ClawBot</span>} size="small" className="mb-4">
            <Paragraph className="text-gray-500 text-xs">基于百度AI的智能助手，支持联网搜索</Paragraph>
            <Tag color="blue">百度AI</Tag>
          </Card>
          <Card title="功能模式" size="small" className="mb-4">
            <Space direction="vertical" className="w-full">
              <Button block type={mode === 'chat' ? 'primary' : 'default'} onClick={() => setMode('chat')}>💬 智能对话</Button>
              <Button block type={mode === 'analyze' ? 'primary' : 'default'} onClick={() => setMode('analyze')}>🔍 深度分析</Button>
            </Space>
          </Card>
          <Card title="快捷功能" size="small">
            <Space direction="vertical" className="w-full">
              {quickActions.map((item, i) => (
                <Button key={i} block onClick={item.action} className="h-auto py-3">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                  </div>
                </Button>
              ))}
            </Space>
          </Card>
        </div>

        {/* 右侧聊天区 */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {messages.length === 0 ? welcomeContent : messagesList}
          </div>
          
          {/* 输入区域 */}
          <div className="px-4 py-3 border-t bg-white flex-shrink-0">
            <div className="flex gap-2">
              <TextArea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="输入你的问题，ClawBot来帮你..." autoSize={{ minRows: 1, maxRows: 3 }} className="flex-1" />
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} disabled={!input.trim()}>发送</Button>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              当前模式：{mode === 'chat' ? '智能对话' : '深度分析'}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端抽屉 */}
      <Drawer title="ClawBot 功能" placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen} width={280}>
        {drawerContent}
      </Drawer>
    </div>
  );
}
