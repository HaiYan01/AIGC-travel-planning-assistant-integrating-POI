# POI 原理与实现

## 目录
1. [POI 基础概念](#1-poi-基础概念)
2. [坐标系统与定位原理](#2-坐标系统与定位原理)
3. [高德地图 POI 搜索原理](#3-高德地图-poi-搜索原理)
4. [项目代码实现](#4-项目代码实现)
5. [精准定位流程](#5-精准定位流程)
6. [示例代码](#6-示例代码)

---

## 1. POI 基础概念

### 1.1 什么是 POI

POI（Point of Interest）= 兴趣点，是地图上的一个具体地理位置。

一个完整的 POI 包含以下信息：

```
┌─────────────────────────────────────┐
│              POI 数据               │
├─────────────────────────────────────┤
│  名称: 天安门广场                   │
│  坐标: 116.397428, 39.90923         │
│  地址: 北京市东城区东长安街         │
│  类别: 风景名胜 > 广场              │
│  电话: 010-65132255                 │
│  评分: 4.8                          │
└─────────────────────────────────────┘
```

### 1.2 POI 数据来源

```
                    POI 数据来源
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   商家入驻          用户上报         政府数据
   (主动提供)        (POI纠错)        (地名普查)
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                    数据清洗验证
                         │
                         ▼
                    POI 数据库
                   (高德/百度/腾讯)
```

---

## 2. 坐标系统与定位原理

### 2.1 常见坐标系

| 坐标系 | 说明 | 使用场景 |
|--------|------|----------|
| WGS84 | GPS原始坐标 | 国际标准 |
| GCJ-02 | 火星坐标（国测局加密） | 高德、腾讯 |
| BD-09 | 百度加密坐标 | 百度地图 |

**坐标转换关系：**
```
WGS84 → GCJ-02 (高德用)
  经度偏移: ΔLng = 0.0065 + 0.0060 * cos(Lat)
  纬度偏移: ΔLat = 0.0060 + 0.0060 * sin(Lng)

GCJ-02 → BD-09 (百度用)
  BD_Lng = GCJ_Lng + 0.0065 + 0.0060 * cos(GCJ_Lat)
  BD_Lat = GCJ_Lat + 0.0060 + 0.0060 * sin(GCJ_Lng)
```

### 2.2 经纬度与像素坐标的转换

地图显示时，需要将经纬度转换为屏幕像素坐标：

**墨卡托投影公式：**
```
x = (lng + 180) / 360 * 256 * 2^zoom
y = (1 - ln(tan(lat * π/180) + 1/cos(lat * π/180)) / π) / 2 * 256 * 2^zoom

其中:
  lng = 经度
  lat = 纬度
  zoom = 缩放级别
  256 = 切片大小(像素)
```

**简化理解：**
```
┌─────────────────────────────────────────┐
│  地球 (经度 -180 ~ +180, 纬度 -90 ~ +90) │
│                    │                     │
│                    ▼                     │
│  墨卡托投影 (将球面映射到平面)           │
│                    │                     │
│                    ▼                     │
│  像素坐标 (0 ~ 256*2^zoom)               │
│                    │                     │
│                    ▼                     │
│  屏幕显示                                 │
└─────────────────────────────────────────┘
```

### 2.3 距离计算公式

两点间距离用 Haversine 公式计算：

```
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)
c = 2 * atan2(√a, √(1-a))
distance = R * c

其中:
  R = 地球半径 ≈ 6371 km
  Δlat = lat2 - lat1
  Δlng = lng2 - lng1
```

---

## 3. 高德地图 POI 搜索原理

### 3.1 搜索流程

```
用户输入关键词 "故宫"
        │
        ▼
   ┌─────────┐
   │  分词   │ → ["故宫", "故宫博物院"]
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ 索引匹配 │ → 倒排索引快速查找
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ 结果排序 │ → 相关度 + 距离 + 热度
   └────┬────┘
        │
        ▼
   返回 POI 列表
```

### 3.2 API 接口说明

**POI 关键字搜索：**
```
GET https://restapi.amap.com/v3/place/text
参数:
  keywords: 搜索关键词
  city: 限定城市（可选）
  citylimit: 是否限制在城市内
  offset: 每页记录数
  page: 页码
  key: 高德Key
```

**返回数据结构：**
```json
{
  "status": "1",
  "count": "100",
  "pois": [
    {
      "id": "B000A7BD6C",
      "name": "故宫博物院",
      "location": "116.397026,39.917839",
      "address": "景山前街4号",
      "pname": "北京市",
      "cityname": "北京市",
      "adname": "东城区",
      "type": "风景名胜",
      "tel": "010-85007421"
    }
  ]
}
```

---

## 4. 项目代码实现

### 4.1 核心服务文件

**`server/src/services/mapService.js`**

```javascript
import { logger } from '../utils/logger.js';

const AMAP_KEY = process.env.AMAP_KEY;
const AMAP_BASE_URL = 'https://restapi.amap.com/v3';

// 地理编码：地址转坐标
export const geocode = async (address, city = '') => {
  try {
    const url = `${AMAP_BASE_URL}/geocode/geo?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&key=${AMAP_KEY}&output=JSON`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.geocodes?.length > 0) {
      // 解析返回的坐标字符串 "116.397,39.908"
      const [lng, lat] = data.geocodes[0].location.split(',');
      return { longitude: parseFloat(lng), latitude: parseFloat(lat) };
    }
    return null;
  } catch (error) {
    logger.error('Geocode error:', error);
    return null;
  }
};

// POI搜索：更精确的地点搜索
export const searchPOI = async (keyword, city = '') => {
  try {
    const url = `${AMAP_BASE_URL}/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}&citylimit=false&key=${AMAP_KEY}&output=JSON&offset=1&page=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.pois?.length > 0) {
      const poi = data.pois[0];
      const [lng, lat] = poi.location.split(',');
      return {
        longitude: parseFloat(lng),
        latitude: parseFloat(lat),
        name: poi.name,
        address: poi.address || poi.pname + poi.cityname + poi.adname + poi.name
      };
    }
    return null;
  } catch (error) {
    logger.error('POI search error:', error);
    return null;
  }
};

// 批量修正行程中的坐标
export const geocodeLocations = async (itinerary, destination) => {
  if (!itinerary?.days) return itinerary;

  const correctedDays = [];

  for (const day of itinerary.days) {
    const correctedActivities = [];

    for (const act of (day.activities || [])) {
      let coords = null;

      // 优先用POI搜索，更精确
      coords = await searchPOI(act.name, destination);

      // 如果POI搜索失败，用地理编码
      if (!coords && act.address) {
        coords = await geocode(act.address, destination);
      }

      if (coords) {
        correctedActivities.push({
          ...act,
          longitude: coords.longitude,
          latitude: coords.latitude
        });
      } else {
        // 保留AI给的坐标作为fallback
        correctedActivities.push(act);
      }

      // 避免请求太快被限制
      await new Promise(r => setTimeout(r, 200));
    }

    correctedDays.push({
      ...day,
      activities: correctedActivities
    });
  }

  return {
    ...itinerary,
    days: correctedDays
  };
};
```

### 4.2 AI 生成行程中的坐标

**`server/src/services/aiService.js`**

```javascript
const TRAVEL_SYSTEM_PROMPT = `你是一个专业的旅行规划师。根据用户需求生成详细的旅行行程。

你必须严格按照以下JSON格式返回：

{
  "title": "行程标题",
  "destination": "城市名",
  "days": [
    {
      "day": 1,
      "activities": [
        {
          "time": "09:00",
          "type": "attraction",
          "name": "故宫博物院",
          "description": "明清皇宫",
          "longitude": 116.397,
          "latitude": 39.908
        }
      ]
    }
  ]
}

要求：
5. 每个activity必须提供longitude（经度）和latitude（纬度），精度至少小数点后4位
6. 坐标必须准确对应实际位置，例如故宫的坐标约为116.397,39.908`;
```

### 4.3 前端地图渲染

**`web/src/components/AMap.jsx`**

```javascript
const showDayMarkers = (dayIndex) => {
  const map = mapInstanceRef.current;
  if (!map || !itinerary?.days) return;

  map.clearMap();

  const day = itinerary.days[dayIndex];
  if (!day?.activities?.length) return;

  day.activities.forEach((act, i) => {
    if (!act.longitude || !act.latitude) return;

    // 经纬度坐标 → 地图标记
    const position = [act.longitude, act.latitude];

    const marker = new window.AMap.Marker({
      position,
      label: {
        content: `<div>${i + 1}. ${act.name}</div>`
      }
    });

    // 信息窗体
    const infoWindow = new window.AMap.InfoWindow({
      content: `
        <h4>${act.name}</h4>
        <p>${act.description || ''}</p>
        <p>📍 ${act.address || ''}</p>
      `
    });

    marker.on('click', () => {
      infoWindow.open(map, position);
    });

    map.add(marker);
  });
};
```

---

## 5. 精准定位流程

### 5.1 完整流程图

```
┌─────────────────────────────────────────────────────────────┐
│                      行程生成请求                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              AI 生成行程（含初步坐标）                       │
│   { name: "故宫", longitude: 116.397, latitude: 39.908 }    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              POI 搜索修正坐标                               │
│                                                             │
│   searchPOI("故宫", "北京")                                 │
│        │                                                    │
│        ▼                                                    │
│   高德API返回: { location: "116.397026,39.917839" }         │
│        │                                                    │
│        ▼                                                    │
│   精确坐标: { longitude: 116.397026, latitude: 39.917839 }  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              前端地图渲染                                   │
│                                                             │
│   坐标 → 像素位置                                           │
│   添加 Marker 标记                                          │
│   绑定点击事件 → 显示信息窗体                               │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 为什么需要 POI 修正

| 方式 | 精度 | 问题 |
|------|------|------|
| AI 生成坐标 | ±100米 | 可能有偏差，大景点可能指向错误入口 |
| POI 搜索 | ±10米 | 官方数据，准确可靠 |

**示例：故宫博物院**
```
AI生成坐标:  116.397, 39.908  (大致位置)
POI搜索结果: 116.397026, 39.917839  (精确入口)
```

### 5.3 双重保障机制

```javascript
// 优先用POI搜索
coords = await searchPOI(act.name, destination);

// POI搜索失败时，用地理编码
if (!coords && act.address) {
  coords = await geocode(act.address, destination);
}

// 都失败时，保留AI给的坐标
if (!coords) {
  coords = { longitude: act.longitude, latitude: act.latitude };
}
```

---

## 6. 示例代码

### 6.1 完整 POI 搜索示例

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>POI 搜索与定位</title>
  <style>
    #container { width: 100%; height: 500px; }
    .search-box { margin: 10px 0; }
    .search-box input { width: 300px; padding: 8px; }
    .search-box button { padding: 8px 16px; }
    .poi-list { max-height: 300px; overflow-y: auto; }
    .poi-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; }
    .poi-item:hover { background: #f5f5f5; }
    .coord { color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="search-box">
    <input type="text" id="keyword" placeholder="输入POI名称（如：故宫博物院）">
    <button onclick="searchPOI()">搜索</button>
  </div>
  <div id="container"></div>
  <div id="poi-list" class="poi-list"></div>

  <script src="https://webapi.amap.com/maps?v=2.0&key=你的KEY"></script>
  <script>
    // 初始化地图
    const map = new AMap.Map('container', {
      zoom: 12,
      center: [116.397428, 39.90923]
    });

    let markers = [];

    // POI搜索
    function searchPOI() {
      const keyword = document.getElementById('keyword').value;
      if (!keyword) return;

      AMap.plugin('AMap.PlaceSearch', () => {
        const placeSearch = new AMap.PlaceSearch({
          pageSize: 10,
          pageIndex: 1
        });

        placeSearch.search(keyword, (status, result) => {
          if (status === 'complete') {
            displayResults(result.poiList.pois);
          }
        });
      });
    }

    // 显示结果列表
    function displayResults(pois) {
      const list = document.getElementById('poi-list');
      list.innerHTML = '';

      // 清除旧标记
      map.remove(markers);
      markers = [];

      pois.forEach((poi, index) => {
        const [lng, lat] = poi.location.split(',');
        
        const div = document.createElement('div');
        div.className = 'poi-item';
        div.innerHTML = `
          <strong>${index + 1}. ${poi.name}</strong>
          <div>${poi.address || ''}</div>
          <div class="coord">坐标: ${lng}, ${lat}</div>
        `;
        div.onclick = () => locatePOI(poi);
        list.appendChild(div);
      });
    }

    // 定位到POI
    function locatePOI(poi) {
      const [lng, lat] = poi.location.split(',');
      const position = [parseFloat(lng), parseFloat(lat)];

      // 清除旧标记
      map.remove(markers);
      markers = [];

      // 添加标记
      const marker = new AMap.Marker({
        position,
        title: poi.name
      });
      map.add(marker);
      markers.push(marker);

      // 移动到该位置
      map.setZoomAndCenter(17, position);

      // 显示信息窗体
      const infoWindow = new AMap.InfoWindow({
        content: `
          <div style="padding:10px">
            <h3>${poi.name}</h3>
            <p>${poi.address || ''}</p>
            <p>经度: ${lng}</p>
            <p>纬度: ${lat}</p>
          </div>
        `
      });
      infoWindow.open(map, position);
    }
  </script>
</body>
</html>
```

### 6.2 后端 POI 搜索调用示例

```javascript
// 调用高德POI搜索API
async function searchPOI(keyword, city) {
  const AMAP_KEY = '你的高德Key';
  const url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}&key=${AMAP_KEY}&output=JSON`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === '1' && data.pois?.length > 0) {
    const poi = data.pois[0];
    const [lng, lat] = poi.location.split(',');
    
    return {
      name: poi.name,
      longitude: parseFloat(lng),
      latitude: parseFloat(lat),
      address: poi.address
    };
  }
  return null;
}

// 使用示例
const result = await searchPOI('故宫博物院', '北京');
console.log(result);
// 输出: { name: '故宫博物院', longitude: 116.397026, latitude: 39.917839, address: '景山前街4号' }
```

---

## 总结

| 概念 | 说明 |
|------|------|
| POI | 地图上的兴趣点，包含名称、坐标、地址等 |
| GCJ-02 | 中国地图使用的加密坐标系（火星坐标） |
| 墨卡托投影 | 将球面经纬度转换为平面像素的算法 |
| POI搜索 | 通过关键词匹配找到精确的地理位置 |
| 双重保障 | AI生成坐标 + POI修正，确保定位准确 |
