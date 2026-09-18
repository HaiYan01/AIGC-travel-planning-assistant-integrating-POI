import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// 智谱AI客户端 (用于行程生成)
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  timeout: 150000, // 单次请求最长 150 秒,避免无限挂起
  maxRetries: 0 // 不自动重试,由上层超时兜底
});

const TRAVEL_SYSTEM_PROMPT = `你是一个专业的旅行规划师。根据用户需求生成详细的旅行行程。

你必须严格按照以下JSON格式返回，不要返回任何其他内容：

{
  "title": "行程标题",
  "destination": "城市名",
  "summary": "行程概要描述",
  "totalBudget": "预估总花费",
  "days": [
    {
      "day": 1,
      "date": "第X天",
      "theme": "当天主题",
      "activities": [
        {
          "time": "09:00",
          "type": "attraction|food|transport|hotel",
          "name": "地点名称",
          "description": "详细描述",
          "duration": "预计时长",
          "cost": "预计花费",
          "address": "详细地址",
          "tips": "小贴士",
          "longitude": 116.397,
          "latitude": 39.908
        }
      ],
      "meals": {
        "breakfast": { "name": "", "recommendation": "", "cost": "" },
        "lunch": { "name": "", "recommendation": "", "cost": "" },
        "dinner": { "name": "", "recommendation": "", "cost": "" }
      },
      "dailyBudget": "当日预估花费"
    }
  ],
  "tips": ["整体旅行建议1", "建议2"],
  "weatherAdvice": "天气穿衣建议",
  "transportAdvice": "交通建议"
}

要求：
1. 每天安排合理，不要过于紧凑
2. 美食推荐要体现当地特色
3. 预算要符合用户要求
4. 景点和餐厅必须使用真实存在的地点
5. 每个activity必须提供longitude（经度）和latitude（纬度），精度至少小数点后4位
6. 坐标必须准确对应实际位置，例如故宫的坐标约为116.397,39.908
7. address字段填写真实详细地址`;

export const generateTravelPlan = async ({ destination, days, budget, preferences, requirements, weatherInfo }) => {
  let weatherPrompt = '';
  
  // 如果有天气信息，添加天气相关提示
  if (weatherInfo) {
    if (weatherInfo.weather) {
      // 有具体日期的天气预报
      const weather = weatherInfo.weather;
      const dayTemp = parseInt(weatherInfo.dayTemp);
      const nightTemp = parseInt(weatherInfo.nightTemp);
      
      weatherPrompt = `
【重要】出行日期天气预报：
- 日期：${weatherInfo.date}
- 天气：${weather}
- 白天温度：${dayTemp}°C，夜间温度：${nightTemp}°C
- 风力：${weatherInfo.wind || '微风'}

请根据天气情况调整行程：
`;
      
      // 根据不同天气给出具体建议
      if (weather.includes('雨') || weather.includes('雷')) {
        weatherPrompt += `- 检测到雨天，请优先安排室内景点（博物馆、商场、室内游乐场等）
- 户外景点安排在雨停时段或缩短户外时间
- 在tips中提醒携带雨具
- 推荐有遮挡的美食街或室内餐厅
`;
      } else if (weather.includes('雪')) {
        weatherPrompt += `- 检测到雪天，请安排适合赏雪的景点
- 注意保暖，推荐室内和室外结合的行程
- 在tips中提醒注意防滑、保暖
- 推荐热饮、火锅等暖身美食
`;
      } else if (weather.includes('雾') || weather.includes('霾')) {
        weatherPrompt += `- 检测到雾天/雾霾，不建议安排高山观景等需要好视野的活动
- 优先安排室内景点或低海拔景点
- 在tips中提醒佩戴口罩
`;
      } else if (dayTemp > 35) {
        weatherPrompt += `- 高温天气，避免中午户外活动
- 优先安排有空调的室内景点
- 推荐清凉解暑的美食
- 在tips中提醒防晒、补水
`;
      } else if (dayTemp < 5) {
        weatherPrompt += `- 低温天气，请安排室内景点为主
- 户外活动安排在中午气温较高时
- 在tips中提醒穿厚羽绒服、保暖内衣
- 推荐热汤、火锅等暖身美食
`;
      } else {
        weatherPrompt += `- 天气良好，适合户外活动
- 可以安排较多户外景点和步行路线
`;
      }
      
      weatherPrompt += `
穿衣建议：${weatherInfo.advice || '请根据温度适当穿衣'}
`;
    } else if (weatherInfo.currentWeather) {
      // 使用实时天气作为参考
      weatherPrompt = `
【参考】当地当前天气：${weatherInfo.currentWeather}，温度${weatherInfo.currentTemp}°C
穿衣建议：${weatherInfo.advice || '请根据温度适当穿衣'}
`;
    }
  }

  const userPrompt = `请为我规划以下旅行：
目的地：${destination}
天数：${days}天
预算：${budget}元
偏好：${preferences.join('、')}
其他要求：${requirements || '无'}
${weatherPrompt}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: TRAVEL_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    const plan = JSON.parse(content);

    logger.info(`Generated travel plan for ${destination}`);
    return plan;
  } catch (error) {
    logger.error('AI generation failed:', error);
    throw new Error('行程生成失败，请稍后重试');
  }
};

export const chatWithAI = async (messages, context, planData = null) => {
  let systemPrompt = `你是一个智能旅行助手，可以回答关于旅行的各种问题，包括：
- 当地天气和穿衣建议
- 景点介绍和推荐
- 美食推荐
- 交通指南
- 注意事项和文化习俗
- 实用小贴士
- 行程总结和优化建议

请用友好、专业的语气回答。如果涉及具体数据（如天气），请说明这是基于一般情况的建议。`;

  // 如果有行程数据，添加到上下文中
  if (planData) {
    systemPrompt += `\n\n当前用户的行程信息：
标题：${planData.title}
目的地：${planData.destination}
天数：${planData.days}天
预算：${planData.budget}元

行程安排：
${JSON.stringify(planData.itinerary, null, 2)}

请基于这个行程为用户提供专业的分析、总结和建议。`;
  } else if (context?.destination) {
    systemPrompt += `\n\n当前用户正在规划：${context.destination} ${context.days}天行程`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 2048
    });

    return completion.choices[0].message.content;
  } catch (error) {
    logger.error('AI chat failed:', error);
    throw new Error('AI助手暂时无法响应，请稍后重试');
  }
};

// 基于用户历史行程进行分析
export const chatWithHistory = async (messages, plansHistory) => {
  // 构建行程摘要
  const historySummary = plansHistory.map((plan, i) => {
    const activities = plan.itinerary?.days?.flatMap(day => 
      day.activities?.map(a => a.name) || []
    ) || [];
    
    return `${i + 1}. ${plan.title}
   - 目的地：${plan.destination}
   - 天数：${plan.days}天
   - 预算：¥${plan.budget}
   - 偏好：${Array.isArray(plan.preferences) ? plan.preferences.join('、') : plan.preferences}
   - 主要景点：${activities.slice(0, 5).join('、')}
   - 创建时间：${new Date(plan.createdAt).toLocaleDateString()}`;
  }).join('\n\n');

  const totalTrips = plansHistory.length;
  const totalDays = plansHistory.reduce((sum, p) => sum + p.days, 0);
  const totalBudget = plansHistory.reduce((sum, p) => sum + p.budget, 0);
  const destinations = [...new Set(plansHistory.map(p => p.destination))];
  const allPreferences = plansHistory.flatMap(p => 
    Array.isArray(p.preferences) ? p.preferences : []
  );
  const preferenceCount = {};
  allPreferences.forEach(p => {
    preferenceCount[p] = (preferenceCount[p] || 0) + 1;
  });
  const topPreferences = Object.entries(preferenceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pref, count]) => `${pref}(${count}次)`)
    .join('、');

  const systemPrompt = `你是一个专业的AI旅行助手，擅长分析用户的旅行历史和偏好。

当前用户的旅行统计：
- 总行程数：${totalTrips}个
- 总旅行天数：${totalDays}天
- 总预算：¥${totalBudget}
- 去过的目的地：${destinations.join('、')}
- 主要偏好：${topPreferences || '无数据'}

用户的所有行程详情：
${historySummary}

请基于以上信息，为用户提供专业的分析、总结和个性化建议。
回答时要：
1. 引用具体的行程数据
2. 分析用户的旅行偏好和模式
3. 提供有价值的洞察和建议
4. 语气友好、专业`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 2048
    });

    return completion.choices[0].message.content;
  } catch (error) {
    logger.error('AI chat with history failed:', error);
    throw new Error('AI助手暂时无法响应，请稍后重试');
  }
};

// Claw - 基于百度AI的智能助手 (支持联网搜索)
export const mimoClawChat = async (messages, mode = 'chat', userPlans = []) => {
  // 构建用户问题
  const lastMessage = messages[messages.length - 1];
  let query = lastMessage?.content || '';
  
  // 根据模式添加前缀
  switch (mode) {
    case 'analyze':
      query = `[深度分析模式] ${query}`;
      break;
    case 'summarize':
      query = `[内容总结模式] ${query}`;
      break;
    default:
      break;
  }
  
  // 如果有用户行程数据，添加到上下文
  if (userPlans && userPlans.length > 0) {
    const plansSummary = userPlans.map((plan, i) => 
      `${i + 1}. ${plan.title} - ${plan.destination} ${plan.days}天`
    ).join('\n');
    query = `用户历史行程：\n${plansSummary}\n\n${query}`;
  }

  try {
    // 调用百度AI API
    const url = `https://agentapi.baidu.com/assistant/getAnswer?appId=${process.env.BAIDU_APP_ID}&secretKey=${process.env.BAIDU_SECRET_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          content: {
            type: 'text',
            value: {
              showText: query
            }
          }
        },
        source: process.env.BAIDU_APP_ID,
        from: 'openapi',
        openId: `user_${Date.now()}`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // 只记录错误摘要,避免把完整响应(含用户内容)写入日志
      logger.error(`Baidu API error: ${response.status} ${String(errorText).slice(0, 200)}`);
      throw new Error(`Baidu API error: ${response.status}`);
    }

    const result = await response.json();
    logger.info(`Baidu API result: status=${result?.status}, contentBlocks=${result?.data?.content?.length ?? 0}`);
    
    // 解析百度AI的响应
    // 格式: {"status":0,"data":{"content":[{"dataType":"txt","data":"..."}]}}
    let reply = '抱歉，我暂时无法回答，请稍后重试。';
    
    if (result && result.status === 0 && result.data && result.data.content) {
      const content = result.data.content;
      if (Array.isArray(content) && content.length > 0) {
        reply = content[0].data || reply;
      }
    } else if (result && result.error_msg) {
      reply = `错误: ${result.error_msg}`;
    }
    
    return reply;
  } catch (error) {
    logger.error('Baidu AI call failed:', error);
    
    // 回退到智谱AI
    try {
      logger.info('Falling back to GLM-4...');
      const systemPrompt = '你是一个智能旅行助手，可以回答旅行相关问题。';
      const fallbackCompletion = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 2048
      });
      return fallbackCompletion.choices[0].message.content;
    } catch (fallbackError) {
      logger.error('Fallback also failed:', fallbackError);
      throw new Error('AI助手暂时无法响应，请稍后重试');
    }
  }
};
