import { Typography, Button, Card, Row, Col, Space, message, Tag, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CompassOutlined,
  RobotOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  ExclamationCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../services/store';
import { api } from '../services/http';

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

const features = [
  {
    icon: <RobotOutlined />,
    title: 'AI智能生成',
    desc: '输入目的地和偏好，AI自动生成详细行程'
  },
  {
    icon: <CompassOutlined />,
    title: '地图可视化',
    desc: '景点自动标记在地图上，路线一目了然'
  },
  {
    icon: <TeamOutlined />,
    title: '攻略社区',
    desc: '分享你的行程，发现更多精彩旅行方案'
  },
  {
    icon: <BulbOutlined />,
    title: 'ClawBot',
    desc: '基于百度AI的智能助手，深度分析旅行'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleNavigate = async (path, needLogin = false) => {
    if (needLogin && !user) {
      message.warning('请先登录后再使用此功能');
      navigate('/login');
      return;
    }
    
    // ClawBot需要检查权限
    if (path === '/claw') {
      if (!user) {
        message.warning('请先登录后再使用此功能');
        navigate('/login');
        return;
      }
      
      try {
        const response = await api.get('/ai/claw/permission');
        if (!response.data.hasPermission) {
          message.error('您暂无权限使用ClawBot，请联系管理员开通');
          return;
        }
      } catch (error) {
        message.error('权限检查失败，请稍后重试');
        return;
      }
    }
    
    navigate(path);
  };

  // Windows ARM下载处理
  const handleWindowsArmDownload = () => {
    confirm({
      title: 'Windows ARM 版本下载',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p className="text-red-500 font-bold mb-3">
            ⚠️ 重要提示：此版本仅适用于 Windows On ARM 设备！
          </p>
          <p className="text-red-500 font-bold mb-3">
            搭载 AMD 与 Intel 处理器的 Windows PC 无法使用此版本。
          </p>
          <p className="text-gray-600 mb-3">
            支持的设备包括：
          </p>
          <ul className="text-gray-500 text-sm mb-4 ml-4 list-disc">
            <li>搭载骁龙 X Elite / 骁龙 8cx 系列芯片的设备</li>
            <li>微软 SQ 系列芯片设备（如 Surface Pro X）</li>
            <li>小米玄戒芯片设备</li>
            <li>华为麒麟 9000C 系列芯片设备</li>
          </ul>
          <p className="mb-2">下载密码：<strong className="text-red-500 text-lg">1234</strong></p>
          <p className="text-gray-500 mt-2">确认您的设备为 ARM 架构后，点击确认下载</p>
        </div>
      ),
      okText: '确认下载',
      cancelText: '取消',
      width: 520,
      onOk() {
        window.open('https://wwbej.lanzoum.com/ixQ9r3lqzvjg', '_blank');
      }
    });
  };

  // Linux ARM下载处理
  const handleLinuxArmDownload = (distro) => {
    confirm({
      title: `Linux ARM64 版本下载`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p className="text-red-500 font-bold mb-3">
            ⚠️ 重要提示：此版本仅适用于 ARM64 架构的 Linux 设备！
          </p>
          <p className="text-gray-600 mb-3">
            请确认您的系统满足以下条件：
          </p>
          <ul className="text-gray-500 text-sm mb-4 ml-4 list-disc">
            <li>处理器架构为 ARM64/aarch64（非 x86_64/AMD64）</li>
            <li>系统为 {distro} 或兼容发行版</li>
            <li>可通过命令 <code className="bg-gray-100 px-1 rounded">uname -m</code> 查看架构</li>
            <li>输出 <code className="bg-gray-100 px-1 rounded">aarch64</code> 表示 ARM64 架构</li>
          </ul>
          <p className="mb-2">下载密码：<strong className="text-red-500 text-lg">1234</strong></p>
          <p className="text-gray-500 mt-2">确认您的设备为 ARM64 架构后，点击确认下载</p>
        </div>
      ),
      okText: '确认下载',
      cancelText: '取消',
      width: 520,
      onOk() {
        window.open('https://wwbej.lanzoum.com/iE0kO3m9lcyh', '_blank');
      }
    });
  };

  // Windows X64下载处理
  const handleWindowsX64Download = () => {
    confirm({
      title: 'Windows X64 版本下载',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p className="text-blue-500 font-bold mb-3">
            请使用搭载 Windows 11 或 Windows 10 64Bit 的 PC
          </p>
          <p className="text-red-500 font-bold mb-3">
            ⚠️ ARM64 设备请下载 ARM 版本
          </p>
          <p className="text-gray-600 mb-3">
            否则将工作在 WOA 模式下，可能影响兼容性和性能。
          </p>
          <p className="text-gray-500 mt-2">点击确定之后开始下载</p>
        </div>
      ),
      okText: '确定下载',
      cancelText: '取消',
      width: 520,
      onOk() {
        window.open('http://cdn.wanghaiyan.cn/AI%E6%97%85%E8%A1%8C%E8%A7%84%E5%88%92%E5%8A%A9%E6%89%8B_amd64.7z', '_blank');
      }
    });
  };

  // Linux Red Hat ARM下载处理
  const handleLinuxRedHatArmDownload = () => {
    confirm({
      title: 'Linux Red Hat ARM64 版本下载',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p className="text-red-500 font-bold mb-3">
            ⚠️ 重要提示：此版本仅适用于 ARM64 架构的 Red Hat 系统设备！
          </p>
          <p className="text-gray-600 mb-3">
            请确认您的系统满足以下条件：
          </p>
          <ul className="text-gray-500 text-sm mb-4 ml-4 list-disc">
            <li>处理器架构为 ARM64/aarch64（非 x86_64/AMD64）</li>
            <li>系统为 Red Hat / CentOS / Fedora 或兼容发行版</li>
            <li>可通过命令 <code className="bg-gray-100 px-1 rounded">uname -m</code> 查看架构</li>
            <li>输出 <code className="bg-gray-100 px-1 rounded">aarch64</code> 表示 ARM64 架构</li>
            <li>可通过命令 <code className="bg-gray-100 px-1 rounded">cat /etc/os-release</code> 确认发行版</li>
          </ul>
          <p className="text-gray-500 mt-2">确认您的设备为 Red Hat 系 ARM64 架构后，点击确定下载</p>
        </div>
      ),
      okText: '确定下载',
      cancelText: '取消',
      width: 520,
      onOk() {
        window.open('http://cdn.wanghaiyan.cn/AI%E6%97%85%E8%A1%8C%E8%A7%84%E5%88%92%E5%8A%A9%E6%89%8B_RH_ARM64.7z', '_blank');
      }
    });
  };

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <div className="py-24 px-6 text-center">
        <div className="container">
          <div className="float-animation inline-block mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg">
              <CompassOutlined className="text-4xl text-white" />
            </div>
          </div>
          <Title level={1} className="!text-5xl !mb-6">
            <span className="gradient-text">AI旅行规划助手</span>
          </Title>
          <Paragraph className="!text-xl text-dark-secondary !mb-10 max-w-2xl mx-auto">
            告别繁琐的行程规划，让AI为你打造个性化旅行方案
            <br />
            只需几句话，即可获得详细的美食、景点、路线推荐
          </Paragraph>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Button
              type="primary"
              size="large"
              className="w-full sm:w-auto h-14 px-8 text-base"
              onClick={() => handleNavigate('/generate', true)}
            >
              开始规划旅程
              <ArrowRightOutlined className="ml-2" />
            </Button>
            <Button
              size="large"
              className="w-full sm:w-auto h-14 px-8 text-base"
              onClick={() => handleNavigate('/community')}
            >
              浏览攻略社区
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 px-6">
        <div className="container">
          <div className="text-center mb-12">
            <Title level={2} className="!mb-4">核心功能</Title>
            <Paragraph className="text-dark-secondary text-lg">
              强大的AI能力，让旅行规划变得简单
            </Paragraph>
          </div>
          <Row gutter={[20, 20]}>
            {features.map((f, i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Card className="liquid-card h-full" bodyStyle={{ padding: '28px 20px' }}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl text-indigo-600">{f.icon}</span>
                  </div>
                  <Title level={4} className="!mb-2">{f.title}</Title>
                  <Paragraph className="text-dark-secondary !mb-0">{f.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Stats */}
      <div className="py-12 px-6">
        <div className="container">
          <Row gutter={[20, 20]} justify="center">
            <Col xs={12} sm={6}>
              <div className="stat-card text-center">
                <div className="stat-value">10K+</div>
                <div className="stat-label">用户数量</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="stat-card text-center">
                <div className="stat-value">50K+</div>
                <div className="stat-label">生成行程</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="stat-card text-center">
                <div className="stat-value">100+</div>
                <div className="stat-label">覆盖城市</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="stat-card text-center">
                <div className="stat-value">4.9</div>
                <div className="stat-label">用户评分</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Claw */}
      <div className="py-16 px-6">
        <div className="container">
          <Card className="liquid-card overflow-hidden" bodyStyle={{ padding: 0 }}>
            <Row gutter={0} align="middle">
              <Col xs={24} md={12} className="p-8 md:p-12">
                <Tag color="blue" className="mb-4">百度AI</Tag>
                <Title level={2} className="!mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    ClawBot
                  </span>
                </Title>
                <Paragraph className="text-gray-600 text-lg mb-6">
                  基于百度AI的智能旅行助手，支持联网搜索，提供深度分析、行程优化、攻略总结等功能。
                </Paragraph>
                <ul className="text-gray-500 mb-6 space-y-2">
                  <li>🌐 联网搜索最新旅行信息</li>
                  <li>🔍 深度分析行程合理性</li>
                  <li>📝 快速总结游记攻略</li>
                  <li>🎯 个性化目的地推荐</li>
                </ul>
                <Button
                  type="primary"
                  size="large"
                  className="bg-gradient-to-r from-blue-600 to-blue-400 border-none"
                  onClick={() => handleNavigate('/claw', true)}
                >
                  体验 ClawBot
                  <ArrowRightOutlined className="ml-2" />
                </Button>
              </Col>
              <Col xs={24} md={12} className="bg-gradient-to-br from-blue-600 to-blue-400 p-8 md:p-12">
                <div className="text-center text-white">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                    <BulbOutlined className="text-5xl" />
                  </div>
                  <Title level={3} className="!text-white !mb-2">智能旅行助手</Title>
                  <Paragraph className="text-white/80">
                    让AI为你的旅行提供专业建议
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>

      {/* Download */}
      <div className="py-16 px-6">
        <div className="container">
          <div className="text-center mb-10">
            <Title level={2} className="!mb-4">下载客户端</Title>
            <Paragraph className="text-dark-secondary text-lg">
              支持多平台，随时随地规划你的旅程
            </Paragraph>
          </div>
          
          {/* Windows */}
          <div className="mb-8">
            <Title level={4} className="!mb-4 text-center">
              <svg className="inline-block mr-2" width="24" height="24" viewBox="0 0 88 88" fill="none">
                <path d="M0 12.4021L35.6426 7.48465V42.437H0V12.4021Z" fill="#00ADEF"/>
                <path d="M40.6577 6.95038L87.9999 0V42.437H40.6577V6.95038Z" fill="#00ADEF"/>
                <path d="M0 45.563H35.6426V80.5154L0 75.5979V45.563Z" fill="#00ADEF"/>
                <path d="M40.6577 45.563H87.9999V88L40.6577 81.0496V45.563Z" fill="#00ADEF"/>
              </svg>
              Windows
            </Title>
            <Row gutter={[12, 12]} justify="center">
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={handleWindowsX64Download}>
                  <div className="font-semibold text-dark">X64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 Intel/AMD 处理器</div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={handleWindowsArmDownload}>
                  <div className="font-semibold text-dark">ARM64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 ARM 处理器</div>
                </Card>
              </Col>
            </Row>
          </div>

          {/* macOS */}
          <div className="mb-8">
            <Title level={4} className="!mb-4 text-center">
              <svg className="inline-block mr-2" width="24" height="24" viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.4-81.1-105.9-207.3-105.9-328.3 0-192.8 125.7-295 249.1-295 65.9 0 120.9 43.2 162.2 43.2 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8.6 15.6 1.3 18.2 2.6.6 6.5 1.3 10.4 1.3 45.4 0 103.3-30.4 139.3-71.4z"/>
              </svg>
              macOS
            </Title>
            <Row gutter={[12, 12]} justify="center">
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => window.open('https://wwbej.lanzoum.com/iB4zz3loi40b', '_blank')}>
                  <div className="font-semibold text-dark">Intel 版本</div>
                  <div className="text-xs text-gray-500 mt-1">支持Intel芯片Mac(支持Rosetta)</div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => window.open('https://wwbej.lanzoum.com/ittNI3loi4ub', '_blank')}>
                  <div className="font-semibold text-dark">Apple Silicon</div>
                  <div className="text-xs text-gray-500 mt-1">适用于Apple Silicon芯片Mac</div>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Linux */}
          <div className="mb-8">
            <Title level={4} className="!mb-4 text-center">
              <img src="/linux-logo.png" alt="Linux" className="inline-block mr-2" style={{ width: 28, height: 28, verticalAlign: 'middle' }} />
              Linux
            </Title>
            
            {/* Ubuntu / Debian */}
            <Paragraph className="text-center text-gray-500 mb-3">Ubuntu / Debian / 统信UOS</Paragraph>
            <Row gutter={[12, 12]} justify="center" className="mb-4">
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => window.open('#', '_blank')}>
                  <div className="font-semibold text-dark">X64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 Intel/AMD 处理器</div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => handleLinuxArmDownload('Debian/Ubuntu')}>
                  <div className="font-semibold text-dark">ARM64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 ARM 处理器</div>
                </Card>
              </Col>
            </Row>

            {/* Red Hat / CentOS / Fedora */}
            <Paragraph className="text-center text-gray-500 mb-3">Red Hat / CentOS / Fedora</Paragraph>
            <Row gutter={[12, 12]} justify="center" className="mb-4">
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => window.open('#', '_blank')}>
                  <div className="font-semibold text-dark">X64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 Intel/AMD 处理器</div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={handleLinuxRedHatArmDownload}>
                  <div className="font-semibold text-dark">ARM64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 ARM 处理器</div>
                </Card>
              </Col>
            </Row>

            {/* Arch Linux */}
            <Paragraph className="text-center text-gray-500 mb-3">Arch Linux</Paragraph>
            <Row gutter={[12, 12]} justify="center">
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => window.open('#', '_blank')}>
                  <div className="font-semibold text-dark">X64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 Intel/AMD 处理器</div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => handleLinuxArmDownload('Arch Linux')}>
                  <div className="font-semibold text-dark">ARM64 版本</div>
                  <div className="text-xs text-gray-500 mt-1">适用于 ARM 处理器</div>
                </Card>
              </Col>
            </Row>
            
            {/* LoongArch/MIPS 提示 */}
            <div className="mt-4 flex justify-center">
              <div className="px-3 py-2 bg-yellow-50 rounded-lg text-center">
                <Text type="warning" className="text-xs">
                  💡 LoongArch/MIPS 设备请下载 X64 版本使用兼容层运行
                </Text>
              </div>
            </div>
          </div>

          {/* 其他平台 */}
          <div>
            <Title level={4} className="!mb-4 text-center">其他平台</Title>
            <Row gutter={[12, 12]} justify="center">
              <Col xs={12} sm={6} md={4}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => window.open('#', '_blank')}>
                  <img src="/android-logo.png" alt="Android" className="mx-auto mb-2" style={{ width: 32, height: 32 }} />
                  <div className="font-semibold text-dark">Android</div>
                  <div className="text-xs text-gray-500 mt-1">APK 下载</div>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Card className="liquid-card text-center opacity-60" bodyStyle={{ padding: '16px' }}>
                  <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 814 1000" fill="#999">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.4-81.1-105.9-207.3-105.9-328.3 0-192.8 125.7-295 249.1-295 65.9 0 120.9 43.2 162.2 43.2 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8.6 15.6 1.3 18.2 2.6.6 6.5 1.3 10.4 1.3 45.4 0 103.3-30.4 139.3-71.4z"/>
                  </svg>
                  <div className="font-semibold text-gray-500">iOS/iPadOS</div>
                  <div className="text-xs text-gray-400 mt-1">无法提供下载</div>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Card className="liquid-card text-center opacity-60" bodyStyle={{ padding: '16px' }}>
                  <div className="w-7 h-7 mx-auto mb-2 rounded bg-gray-300 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">H</span>
                  </div>
                  <div className="font-semibold text-gray-500">HarmonyOS</div>
                  <div className="text-xs text-red-400 mt-1">不予支持</div>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Card className="liquid-card text-center cursor-pointer hover:shadow-lg transition-all" 
                      bodyStyle={{ padding: '16px' }}
                      onClick={() => navigate('/generate')}>
                  <div className="text-2xl mb-1">🌐</div>
                  <div className="font-semibold text-dark">网页版</div>
                  <div className="text-xs text-gray-500 mt-1">无需下载</div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-6 text-center">
        <div className="container">
          <Card className="liquid-card max-w-2xl mx-auto" bodyStyle={{ padding: '40px' }}>
            <Title level={3} className="!mb-4">
              准备好开启你的完美旅程了吗？
            </Title>
            <Paragraph className="text-dark-secondary mb-6 text-lg">
              数万用户已使用AI助手规划了他们的旅行
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="h-12 px-10 text-base"
              onClick={() => navigate('/generate')}
            >
              立即开始
              <ArrowRightOutlined className="ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
