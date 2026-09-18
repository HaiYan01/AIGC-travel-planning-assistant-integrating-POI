import { useEffect, useRef, useState } from 'react';
import { Spin, Empty, Button, Space, Modal } from 'antd';
import { CarOutlined, AimOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const AMapComponent = ({ itinerary }) => {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAMapScript();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapReady && itinerary?.days?.length > 0) {
      showDayMarkers(selectedDay);
    }
  }, [itinerary, mapReady, selectedDay]);

  const loadAMapScript = () => {
    if (window.AMap) {
      initMap();
      return;
    }
    if (document.getElementById('amap-script')) {
      // Script already loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.AMap) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 100);
      return;
    }

    const key = import.meta.env.VITE_AMAP_KEY;
    if (!key) {
      setError('请配置高德地图Key：在 .env.development 中设置 VITE_AMAP_KEY');
      setLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.id = 'amap-script';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
    script.onload = () => setTimeout(initMap, 100);
    script.onerror = () => {
      setError('地图加载失败，请检查网络连接');
      setLoading(false);
    };
    
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!window.AMap || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = new window.AMap.Map(mapRef.current, {
        zoom: 12,
        center: [116.397428, 39.90923], // 默认北京
        viewMode: '2D'
      });

      map.on('complete', () => {
        mapInstanceRef.current = map;
        setLoading(false);
        setMapReady(true);
        setError(null);
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setError('地图初始化失败');
        setLoading(false);
      });
    } catch (e) {
      console.error('Map init error:', e);
      setError('地图初始化异常: ' + e.message);
      setLoading(false);
    }
  };

  const showDayMarkers = (dayIndex) => {
    const map = mapInstanceRef.current;
    if (!map || !itinerary?.days) return;

    map.clearMap();

    const day = itinerary.days[dayIndex];
    if (!day?.activities?.length) return;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const color = colors[dayIndex % colors.length];
    const allMarkers = [];
    const path = [];

    day.activities.forEach((act, i) => {
      if (!act.longitude || !act.latitude) return;

      const position = [act.longitude, act.latitude];
      path.push(position);

      const marker = new window.AMap.Marker({
        position,
        label: {
          content: `<div style="
            background: ${color};
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          ">${i + 1}. ${act.name}</div>`,
          offset: new window.AMap.Pixel(-30, -40)
        }
      });

      const infoWindow = new window.AMap.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 220px;">
            <h4 style="margin: 0 0 8px; font-size: 15px;">${act.name}</h4>
            <p style="margin: 0 0 6px; color: #666; font-size: 13px;">${act.description || ''}</p>
            ${act.address ? `<p style="margin: 0; color: #999; font-size: 12px;">📍 ${act.address}</p>` : ''}
            ${act.tips ? `<p style="margin: 6px 0 0; color: #f59e0b; font-size: 12px;">💡 ${act.tips}</p>` : ''}
            <a href="https://uri.amap.com/navigation?to=${position[0]},${position[1]},${act.name}&mode=car" 
               target="_blank"
               style="display: inline-block; margin-top: 10px; padding: 6px 16px; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 13px;">
              🧭 导航到这里
            </a>
          </div>
        `,
        offset: new window.AMap.Pixel(0, -20)
      });

      marker.on('click', () => {
        infoWindow.open(map, position);
      });

      map.add(marker);
      allMarkers.push(marker);
    });

    if (path.length > 1) {
      const polyline = new window.AMap.Polyline({
        path,
        strokeColor: color,
        strokeWeight: 4,
        strokeStyle: 'dashed',
        strokeOpacity: 0.8
      });
      map.add(polyline);
    }

    if (allMarkers.length > 0) {
      map.setFitView(allMarkers, false, [80, 80, 80, 80]);
    }
  };

  const planRoute = (mode) => {
    const map = mapInstanceRef.current;
    const day = itinerary?.days?.[selectedDay];
    if (!map || !day?.activities?.length || day.activities.length < 2) {
      Modal.info({ title: '提示', content: '该天行程点不足，无法规划路线' });
      return;
    }

    const activities = day.activities.filter(a => a.longitude && a.latitude);
    if (activities.length < 2) {
      Modal.info({ title: '提示', content: '该天行程点不足' });
      return;
    }

    map.clearMap();

    const start = [activities[0].longitude, activities[0].latitude];
    const end = [activities[activities.length - 1].longitude, activities[activities.length - 1].latitude];
    const waypoints = activities.slice(1, -1).map(a => [a.longitude, a.latitude]);

    const RoutePlugin = mode === 'driving' ? window.AMap.Driving : window.AMap.Walking;
    const router = new RoutePlugin({ map });

    router.search(
      new window.AMap.LngLat(start[0], start[1]),
      new window.AMap.LngLat(end[0], end[1]),
      { waypoints: waypoints.map(p => new window.AMap.LngLat(p[0], p[1])) },
      (status, result) => {
        if (status !== 'complete') {
          Modal.error({ title: '失败', content: '路线规划失败' });
          showDayMarkers(selectedDay);
        }
      }
    );
  };

  const openNavigation = () => {
    const day = itinerary?.days?.[selectedDay];
    const activities = day?.activities?.filter(a => a.longitude && a.latitude);
    if (!activities?.length) {
      Modal.info({ title: '提示', content: '该天没有行程点' });
      return;
    }

    let url = 'https://uri.amap.com/navigation?';
    const first = activities[0];
    const last = activities[activities.length - 1];

    if (activities.length === 1) {
      url += `to=${first.longitude},${first.latitude},${first.name}&mode=car`;
    } else {
      url += `from=${first.longitude},${first.latitude}&to=${last.longitude},${last.latitude},${last.name}&mode=car`;
    }

    window.open(url, '_blank');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-gray-500">{error}</div>
          <div className="text-xs text-gray-400 mt-2">请检查 VITE_AMAP_KEY 配置</div>
        </div>
      </div>
    );
  }

  if (!itinerary?.days?.length) {
    return <Empty description="暂无地图数据" />;
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-20">
          <Spin size="large" />
          <div className="ml-3 text-gray-500">地图加载中...</div>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2 items-center justify-between">
        <Space wrap>
          {itinerary.days.map((day, i) => (
            <Button
              key={i}
              type={selectedDay === i ? 'primary' : 'default'}
              size="small"
              onClick={() => setSelectedDay(i)}
            >
              第{day.day}天
            </Button>
          ))}
        </Space>
        <Space>
          <Button icon={<CarOutlined />} size="small" onClick={() => planRoute('driving')}>
            驾车路线
          </Button>
          <Button icon={<AimOutlined />} size="small" onClick={() => planRoute('walking')}>
            步行路线
          </Button>
          <Button icon={<AimOutlined />} size="small" type="primary" onClick={openNavigation}>
            开始导航
          </Button>
        </Space>
      </div>

      <div ref={mapRef} style={{ height: 400, width: '100%', borderRadius: 12 }} />

      <div className="absolute bottom-3 left-3 bg-white/95 p-3 rounded-lg shadow-lg text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">图例</span>
          <Button 
            type="text" 
            size="small" 
            icon={showLegend ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => setShowLegend(!showLegend)}
            className="!p-0 !h-auto"
          />
        </div>
        {showLegend && itinerary.days.map((day, i) => (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] }}
            />
            <span>第{day.day}天 - {day.theme}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AMapComponent;
