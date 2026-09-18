import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const attractions = [
  // 杭州景点
  { name: '西湖', city: '杭州', address: '杭州市西湖区', longitude: 120.14802, latitude: 30.24223, category: '景点', description: '世界文化遗产，杭州标志性景点', rating: 4.9 },
  { name: '灵隐寺', city: '杭州', address: '杭州市西湖区灵隐路法云弄1号', longitude: 120.10042, latitude: 30.24067, category: '景点', description: '中国佛教禅宗十大古刹之一', rating: 4.7 },
  { name: '断桥', city: '杭州', address: '杭州市西湖区北山街', longitude: 120.15557, latitude: 30.25924, category: '景点', description: '西湖十景之一，白娘子传说发源地', rating: 4.6 },
  { name: '楼外楼', city: '杭州', address: '杭州市西湖区孤山路30号', longitude: 120.14215, latitude: 30.25405, category: '美食', description: '百年老字号，正宗杭帮菜', rating: 4.5 },
  { name: '知味观', city: '杭州', address: '杭州市上城区仁和路83号', longitude: 120.16845, latitude: 30.24868, category: '美食', description: '杭州著名小吃店', rating: 4.4 },

  // 成都景点
  { name: '宽窄巷子', city: '成都', address: '成都市青羊区长顺街附近', longitude: 104.05825, latitude: 30.66754, category: '景点', description: '成都历史文化保护区', rating: 4.7 },
  { name: '锦里', city: '成都', address: '成都市武侯区武侯祠大街231号', longitude: 104.04789, latitude: 30.64438, category: '景点', description: '西蜀第一街', rating: 4.6 },
  { name: '大熊猫繁育基地', city: '成都', address: '成都市成华区熊猫大道1375号', longitude: 104.14778, latitude: 30.73516, category: '景点', description: '观赏大熊猫最佳去处', rating: 4.8 },
  { name: '小龙坎火锅', city: '成都', address: '成都市锦江区', longitude: 104.08316, latitude: 30.65378, category: '美食', description: '成都著名火锅品牌', rating: 4.5 },
  { name: '陈麻婆豆腐', city: '成都', address: '成都市青羊区西玉龙街197号', longitude: 104.06689, latitude: 30.66312, category: '美食', description: '正宗麻婆豆腐发源地', rating: 4.6 },

  // 北京景点
  { name: '故宫', city: '北京', address: '北京市东城区景山前街4号', longitude: 116.39702, latitude: 39.91747, category: '景点', description: '世界上最大的宫殿建筑群', rating: 4.9 },
  { name: '长城', city: '北京', address: '北京市延庆区八达岭镇', longitude: 116.01667, latitude: 40.35889, category: '景点', description: '世界文化遗产', rating: 4.8 },
  { name: '天坛', city: '北京', address: '北京市东城区天坛路甲1号', longitude: 116.41063, latitude: 39.88222, category: '景点', description: '明清两代帝王祭天之所', rating: 4.7 },
  { name: '全聚德', city: '北京', address: '北京市东城区前门大街30号', longitude: 116.39597, latitude: 39.89924, category: '美食', description: '百年老字号烤鸭店', rating: 4.4 },
  { name: '东来顺', city: '北京', address: '北京市东城区王府井大街198号', longitude: 116.40768, latitude: 39.91434, category: '美食', description: '著名老字号涮羊肉', rating: 4.5 }
];

async function main() {
  console.log('Seeding attractions...');

  for (const attr of attractions) {
    await prisma.attraction.upsert({
      where: { id: 0 },
      update: attr,
      create: attr
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
