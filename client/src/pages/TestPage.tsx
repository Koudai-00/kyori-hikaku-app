import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function TestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  
  // 固定の住所
  const FIXED_ORIGIN = "東京駅、〒100-0005 東京都千代田区丸の内１丁目";
  const FIXED_DESTINATION = "新宿駅、〒160-0022 東京都新宿区新宿３丁目３８−１";

  const runTransitTest = async () => {
    setLoading(true);
    setDebugInfo(null);
    setResults(null);
    
    const testStartTime = Date.now();
    console.log("=== 公共交通 固定住所テスト開始 ===");
    console.log(`出発地: ${FIXED_ORIGIN}`);
    console.log(`目的地: ${FIXED_DESTINATION}`);
    
    try {
      const requestBody = {
        origin: FIXED_ORIGIN,
        destinations: [FIXED_DESTINATION],
        travelMode: "transit"
      };
      
      console.log("リクエスト送信:", requestBody);
      
      const response = await fetch("/api/calculate-distances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      const testEndTime = Date.now();
      const responseTime = testEndTime - testStartTime;
      
      console.log("API レスポンス:", data);
      
      // デバッグ情報を保存
      setDebugInfo({
        requestBody,
        responseStatus: response.status,
        responseTime: responseTime,
        rawResponse: data,
        timestamp: new Date().toLocaleString('ja-JP')
      });

      if (!response.ok) {
        throw new Error(data.error || `APIエラー (${response.status})`);
      }

      setResults(data);
      toast({
        title: "テスト完了",
        description: `公共交通テストが完了しました (${responseTime}ms)`,
      });
    } catch (error: any) {
      console.error("テストエラー:", error);
      setDebugInfo(prev => ({
        ...prev,
        error: error.message,
        errorTime: new Date().toLocaleString('ja-JP')
      }));
      toast({
        title: "テスト失敗",
        description: error.message || "公共交通テストに失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚇 公共交通テスト（固定住所）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">テスト設定</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>出発地:</strong> {FIXED_ORIGIN}</div>
              <div><strong>目的地:</strong> {FIXED_DESTINATION}</div>
              <div><strong>交通手段:</strong> 公共交通機関（transit）</div>
              <div><strong>API:</strong> Google Maps Directions API</div>
            </div>
          </div>

          <Button 
            onClick={runTransitTest} 
            disabled={loading} 
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                テスト実行中...
              </div>
            ) : (
              "🚇 公共交通テストを実行"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* テスト結果表示 */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>
              {results.results?.[0]?.error ? "❌ テスト失敗" : "✅ テスト結果"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 基本情報 */}
              <div className={`p-4 rounded-lg ${results.results?.[0]?.error ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="text-sm space-y-1">
                  <div><strong>出発地:</strong> {FIXED_ORIGIN}</div>
                  <div><strong>目的地:</strong> {FIXED_DESTINATION}</div>
                  <div><strong>交通手段:</strong> 公共交通機関</div>
                </div>
              </div>
              
              {/* 結果テーブル */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">目的地</th>
                      <th className="border border-gray-300 p-3 text-left">距離</th>
                      <th className="border border-gray-300 p-3 text-left">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results?.map((result: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3 font-medium">
                          {result.destination}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {result.error ? (
                            <span className="text-red-600 font-semibold">エラー</span>
                          ) : (
                            <span className="text-green-600 font-semibold">{result.distance}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-3">
                          {result.error ? (
                            <span className="text-red-600 font-semibold">エラー</span>
                          ) : (
                            <span className="text-green-600 font-semibold">{result.duration}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* エラー詳細 */}
              {results.results?.[0]?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">❌ エラー詳細</h4>
                  <p className="text-red-700 text-sm">{results.results[0].error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* デバッグ情報表示 */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 デバッグ情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>レスポンス時間:</strong> {debugInfo.responseTime}ms</div>
                <div><strong>ステータス:</strong> {debugInfo.responseStatus}</div>
                <div><strong>実行時刻:</strong> {debugInfo.timestamp}</div>
                {debugInfo.error && (
                  <div className="col-span-2 text-red-600">
                    <strong>エラー:</strong> {debugInfo.error}
                  </div>
                )}
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold bg-gray-100 p-2 rounded text-sm">
                  📊 完全なAPIレスポンス
                </summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto border max-h-96">
                  {JSON.stringify(debugInfo.rawResponse, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}