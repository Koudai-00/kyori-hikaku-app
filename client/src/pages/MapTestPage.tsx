import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// <!--ここからテスト-->
interface GoogleMapsConfig {
  apiKey: string;
}

type TravelMode = "driving" | "walking" | "bicycling";

export default function MapTestPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeVisible, setRouteVisible] = useState(false);

  const { data: config } = useQuery<GoogleMapsConfig>({
    queryKey: ["/api/google-maps-config"],
  });

  // デバッグ用関数
  const debugLog = (message: string) => {
    console.log(`[MapTest] ${message}`);
    const logElement = document.getElementById("debug-log");
    if (logElement) {
      logElement.textContent += `${new Date().toLocaleTimeString()}: ${message}\n`;
    }
  };

  useEffect(() => {
    debugLog("MapTestPage useEffect triggered");
    debugLog(`Config loaded: ${!!config}`);
    debugLog(`API Key available: ${!!config?.apiKey}`);
    debugLog(`Map element available: ${!!mapRef.current}`);

    if (!config?.apiKey) {
      debugLog("Waiting for API key...");
      return;
    }

    if (!mapRef.current) {
      debugLog("Map element not found");
      return;
    }

    const loadGoogleMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        debugLog("Checking if Google Maps is already loaded...");
        
        if (window.google && window.google.maps) {
          debugLog("Google Maps already loaded, proceeding to initialize");
          initializeMap();
          resolve();
          return;
        }

        debugLog("Loading Google Maps script...");
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;

        (window as any).initMap = () => {
          debugLog("Google Maps callback triggered");
          initializeMap();
          resolve();
        };

        script.onerror = (error) => {
          debugLog("Google Maps script loading failed");
          console.error('Google Maps API ロード失敗:', error);
          alert('Google Maps API の読み込みに失敗しました');
          reject(new Error('Google Maps script loading failed'));
        };

        script.onload = () => {
          debugLog("Google Maps script loaded successfully");
        };

        debugLog("Appending script to head");
        document.head.appendChild(script);
      });
    };

    const initializeMap = () => {
      debugLog("Starting map initialization...");
      
      if (!mapRef.current) {
        debugLog("Map element not found during initialization");
        return;
      }

      debugLog("Map element found, creating map instance...");

      // 東京駅の座標
      const tokyoStation = { lat: 35.6812362, lng: 139.7671248 };
      // 新宿駅の座標
      const shinjukuStation = { lat: 35.6896067, lng: 139.7005713 };

      debugLog(`Tokyo Station coordinates: ${JSON.stringify(tokyoStation)}`);
      debugLog(`Shinjuku Station coordinates: ${JSON.stringify(shinjukuStation)}`);

      try {
        debugLog("Creating Google Maps instance...");
        
        // 地図を初期化（東京駅を中心にズーム14で表示）
        const map = new google.maps.Map(mapRef.current, {
          zoom: 14,
          center: tokyoStation,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        debugLog("Google Maps instance created successfully");
        mapInstanceRef.current = map;

        // DirectionsServiceとDirectionsRendererを初期化
        debugLog("Initializing Directions services...");
        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          draggable: false,
          map: map,
        });

        // 東京駅にマーカーを追加
        debugLog("Adding Tokyo Station marker...");
        const tokyoMarker = new google.maps.Marker({
          position: tokyoStation,
          map: map,
          title: "東京駅（出発地）",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
          }
        });

        // 新宿駅にマーカーを追加
        debugLog("Adding Shinjuku Station marker...");
        const shinjukuMarker = new google.maps.Marker({
          position: shinjukuStation,
          map: map,
          title: "新宿駅（目的地）",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          }
        });

        // 情報ウィンドウを追加
        debugLog("Creating info windows...");
        const tokyoInfoWindow = new google.maps.InfoWindow({
          content: "<div><strong>東京駅</strong><br>〒100-0005 東京都千代田区丸の内1丁目9<br>（出発地）</div>"
        });

        const shinjukuInfoWindow = new google.maps.InfoWindow({
          content: "<div><strong>新宿駅</strong><br>〒160-0022 東京都新宿区新宿3丁目38−1<br>（目的地）</div>"
        });

        // マーカークリック時の情報ウィンドウ表示
        debugLog("Adding event listeners...");
        tokyoMarker.addListener("click", () => {
          debugLog("Tokyo marker clicked");
          tokyoInfoWindow.open(map, tokyoMarker);
        });

        shinjukuMarker.addListener("click", () => {
          debugLog("Shinjuku marker clicked");
          shinjukuInfoWindow.open(map, shinjukuMarker);
        });

        debugLog("Map initialization completed successfully!");
        console.log("Google Maps initialized successfully");
        console.log("Tokyo Station:", tokyoStation);
        console.log("Shinjuku Station:", shinjukuStation);
      } catch (error) {
        debugLog(`Map initialization failed: ${error}`);
        console.error("Map initialization error:", error);
      }
    };

    loadGoogleMapsScript().catch((error) => {
      debugLog(`Failed to load Google Maps: ${error}`);
      console.error('Failed to load Google Maps:', error);
    });

    return () => {
      // クリーンアップ
      debugLog("Cleaning up map instance");
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [config?.apiKey]);

  // コンポーネントマウント時の初期デバッグ
  useEffect(() => {
    debugLog("MapTestPage component mounted");
    debugLog(`Window dimensions: ${window.innerWidth}x${window.innerHeight}`);
    debugLog(`Document ready state: ${document.readyState}`);
    
    // DOM要素の確認
    const mapElement = document.getElementById('map');
    debugLog(`Map element by ID found: ${!!mapElement}`);
    
    return () => {
      debugLog("MapTestPage component unmounting");
    };
  }, []);

  // ルート表示機能
  const showRoute = () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !mapInstanceRef.current) {
      debugLog("Directions services not available");
      return;
    }

    debugLog(`Calculating route with travel mode: ${travelMode}`);

    const tokyoStation = { lat: 35.6812362, lng: 139.7671248 };
    const shinjukuStation = { lat: 35.6896067, lng: 139.7005713 };

    const travelModeMap = {
      driving: google.maps.TravelMode.DRIVING,
      walking: google.maps.TravelMode.WALKING,
      bicycling: google.maps.TravelMode.BICYCLING,
    };

    const request = {
      origin: tokyoStation,
      destination: shinjukuStation,
      travelMode: travelModeMap[travelMode],
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        debugLog("Route calculation successful");
        directionsRendererRef.current?.setDirections(result);
        setRouteVisible(true);
        
        // ルート情報をログに出力
        const route = result.routes[0];
        const leg = route.legs[0];
        debugLog(`Distance: ${leg.distance?.text}, Duration: ${leg.duration?.text}`);
      } else {
        debugLog(`Route calculation failed: ${status}`);
        console.error("Directions request failed due to " + status);
      }
    });
  };

  // ルートを非表示にする
  const hideRoute = () => {
    if (directionsRendererRef.current) {
      debugLog("Hiding route");
      directionsRendererRef.current.setDirections({ routes: [] } as any);
      setRouteVisible(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Google Maps JavaScript API テスト</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div>
              <p><strong>出発地:</strong> 東京駅（〒100-0005 東京都千代田区丸の内1丁目9）</p>
              <p><strong>目的地:</strong> 新宿駅（〒160-0022 東京都新宿区新宿3丁目38−1）</p>
            </div>
            <div>
              <p><strong>地図中心:</strong> 東京駅、ズーム14</p>
              <p><strong>ルート表示:</strong> {routeVisible ? "表示中" : "非表示"}</p>
            </div>
          </div>
          
          {/* <!--ここからテスト--> */}
          <div className="border-t pt-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  移動手段を選択
                </label>
                <Select value={travelMode} onValueChange={(value: TravelMode) => setTravelMode(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="移動手段を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving">🚗 車（ドライビング）</SelectItem>
                    <SelectItem value="walking">🚶 徒歩（ウォーキング）</SelectItem>
                    <SelectItem value="bicycling">🚲 自転車（サイクリング）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={showRoute}
                  disabled={!mapInstanceRef.current}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ルート表示
                </Button>
                <Button 
                  onClick={hideRoute}
                  disabled={!routeVisible}
                  variant="outline"
                >
                  ルート非表示
                </Button>
              </div>
            </div>
          </div>
          {/* <!--ここまでテスト--> */}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* <!--ここからテスト--> */}
          <div 
            ref={mapRef}
            id="map"
            className="w-full h-96 md:h-[500px]"
            style={{ 
              width: '100%', 
              height: '400px', 
              minHeight: '400px',
              backgroundColor: '#eee'
            }}
          />
          {/* <!--ここまでテスト--> */}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">デバッグログ</h3>
          </div>
          {/* <!--ここからテスト--> */}
          <div 
            id="debug-log"
            className="p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64"
            style={{ 
              backgroundColor: '#f8f8f8',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}
          >
            デバッグログがここに表示されます...
          </div>
          {/* <!--ここまでテスト--> */}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">テスト項目</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ 地図が正常に表示される</li>
            <li>✓ 東京駅（緑のマーカー）が表示される</li>
            <li>✓ 新宿駅（赤のマーカー）が表示される</li>
            <li>✓ マーカーをクリックすると情報ウィンドウが表示される</li>
            <li>✓ 地図操作（ズーム、パン）が可能</li>
            <li>🔵 移動手段を選択できる（車・徒歩・自転車）</li>
            <li>🔵 「ルート表示」ボタンでルートが地図上に表示される</li>
            <li>🔵 「ルート非表示」ボタンでルートが消える</li>
            <li>🔵 移動手段を変更してルートを再表示できる</li>
            <li>🔵 距離と所要時間がデバッグログに表示される</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
// <!--ここまでテスト-->