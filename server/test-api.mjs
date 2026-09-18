import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'API_KEY',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4'
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [{ role: 'user', content: '你好' }]
    });
    console.log('成功:', completion.choices[0].message.content);
  } catch (error) {
    console.log('失败:', error.message);
    console.log('错误码:', error.code);
    console.log('状态:', error.status);
  }
}

test();
