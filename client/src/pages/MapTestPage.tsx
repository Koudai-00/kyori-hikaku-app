import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

// <!--ここからテスト-->
interface GoogleMapsConfig {
  apiKey: string;
}

export default function MapTestPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const { data: config } = useQuery<GoogleMapsConfig>({
    queryKey: ["/api/google-maps-config"],
  });

  useEffect(() => {
    if (!config?.apiKey || !mapRef.current) return;

    const loadGoogleMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;

        (window as any).initMap = () => {
          initializeMap();
          resolve();
        };

        script.onerror = () => reject(new Error('Google Maps script loading failed'));
        document.head.appendChild(script);
      });
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      // 東京駅の座標
      const tokyoStation = { lat: 35.6812362, lng: 139.7671248 };
      // 新宿駅の座標
      const shinjukuStation = { lat: 35.6896067, lng: 139.7005713 };

      // 地図を初期化（東京駅を中心にズーム14で表示）
      const map = new google.maps.Map(mapRef.current, {
        zoom: 14,
        center: tokyoStation,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });

      mapInstanceRef.current = map;

      // 東京駅にマーカーを追加
      const tokyoMarker = new google.maps.Marker({
        position: tokyoStation,
        map: map,
        title: "東京駅（出発地）",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
      });

      // 新宿駅にマーカーを追加
      const shinjukuMarker = new google.maps.Marker({
        position: shinjukuStation,
        map: map,
        title: "新宿駅（目的地）",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
      });

      // 情報ウィンドウを追加
      const tokyoInfoWindow = new google.maps.InfoWindow({
        content: "<div><strong>東京駅</strong><br>〒100-0005 東京都千代田区丸の内1丁目9<br>（出発地）</div>"
      });

      const shinjukuInfoWindow = new google.maps.InfoWindow({
        content: "<div><strong>新宿駅</strong><br>〒160-0022 東京都新宿区新宿3丁目38−1<br>（目的地）</div>"
      });

      // マーカークリック時の情報ウィンドウ表示
      tokyoMarker.addListener("click", () => {
        tokyoInfoWindow.open(map, tokyoMarker);
      });

      shinjukuMarker.addListener("click", () => {
        shinjukuInfoWindow.open(map, shinjukuMarker);
      });

      console.log("Google Maps initialized successfully");
      console.log("Tokyo Station:", tokyoStation);
      console.log("Shinjuku Station:", shinjukuStation);
    };

    loadGoogleMapsScript().catch((error) => {
      console.error('Failed to load Google Maps:', error);
    });

    return () => {
      // クリーンアップ
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [config?.apiKey]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Google Maps JavaScript API テスト</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>出発地:</strong> 東京駅（〒100-0005 東京都千代田区丸の内1丁目9）</p>
              <p><strong>目的地:</strong> 新宿駅（〒160-0022 東京都新宿区新宿3丁目38−1）</p>
            </div>
            <div>
              <p><strong>移動手段:</strong> 車（DRIVING）</p>
              <p><strong>地図中心:</strong> 東京駅、ズーム14</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div 
            ref={mapRef}
            className="w-full h-96 md:h-[500px]"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">テスト項目</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ 地図が正常に表示される</li>
            <li>✓ 東京駅（緑のマーカー）が表示される</li>
            <li>✓ 新宿駅（赤のマーカー）が表示される</li>
            <li>✓ マーカーをクリックすると情報ウィンドウが表示される</li>
            <li>✓ 地図操作（ズーム、パン）が可能</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
// <!--ここまでテスト-->