import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // フォーム状態
  const [origin, setOrigin] = useState("東京駅");
  const [destination, setDestination] = useState("新宿駅");
  const [travelMode, setTravelMode] = useState("transit");
  const [departureTime, setDepartureTime] = useState("now");

  const getDepartureTimeValue = () => {
    const now = new Date();
    switch (departureTime) {
      case "now":
        return Math.floor(now.getTime() / 1000);
      case "plus30":
        return Math.floor((now.getTime() + 30 * 60 * 1000) / 1000);
      case "plus60":
        return Math.floor((now.getTime() + 60 * 60 * 1000) / 1000);
      case "tomorrow9":
        const tomorrow9am = new Date();
        tomorrow9am.setDate(tomorrow9am.getDate() + 1);
        tomorrow9am.setHours(9, 0, 0, 0);
        return Math.floor(tomorrow9am.getTime() / 1000);
      default:
        return Math.floor(now.getTime() / 1000);
    }
  };

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log("=== 公共交通デバッグテスト開始 ===");
      
      const requestData = {
        origin,
        destinations: [destination],
        travelMode,
        ...(travelMode === 'transit' && { departureTime: getDepartureTimeValue() })
      };

      console.log("リクエスト送信:", requestData);
      console.log("出発時刻（Unix）:", travelMode === 'transit' ? getDepartureTimeValue() : "N/A");
      console.log("出発時刻（人間可読）:", travelMode === 'transit' ? new Date(getDepartureTimeValue() * 1000).toLocaleString('ja-JP') : "N/A");

      const response = await fetch('/api/calculate-distances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log("API レスポンス:", result);

      setTestResult({
        status: response.status,
        statusText: response.statusText,
        data: result,
        request: requestData,
        departureTimeReadable: travelMode === 'transit' ? new Date(getDepartureTimeValue() * 1000).toLocaleString('ja-JP') : "N/A"
      });

    } catch (error) {
      console.error("テストエラー:", error);
      setTestResult({
        error: error instanceof Error ? error.message : "Unknown error",
        request: {
          origin,
          destinations: [destination],
          travelMode
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasError = testResult?.data?.results?.[0]?.error === "ZERO_RESULTS" || testResult?.error;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚇 公共交通ルート デバッグテスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 入力フォーム */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="origin">出発地</Label>
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="例: 東京駅"
              />
            </div>
            
            <div>
              <Label htmlFor="destination">目的地</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例: 新宿駅"
              />
            </div>

            <div>
              <Label htmlFor="travelMode">交通手段</Label>
              <Select value={travelMode} onValueChange={setTravelMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transit">🚇 公共交通</SelectItem>
                  <SelectItem value="driving">🚗 車</SelectItem>
                  <SelectItem value="walking">🚶 徒歩</SelectItem>
                  <SelectItem value="bicycling">🚴 自転車</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {travelMode === 'transit' && (
              <div>
                <Label htmlFor="departureTime">出発時刻</Label>
                <Select value={departureTime} onValueChange={setDepartureTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">現在</SelectItem>
                    <SelectItem value="plus30">30分後</SelectItem>
                    <SelectItem value="plus60">1時間後</SelectItem>
                    <SelectItem value="tomorrow9">明日朝9時</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button 
            onClick={runTest}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "テスト実行中..." : "🔍 テスト実行"}
          </Button>

          {/* エラー案内 */}
          {hasError && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="text-amber-800">
                  <h4 className="font-semibold mb-2">⚠️ ルートが見つかりません</h4>
                  <p className="text-sm mb-2">以下をお試しください：</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>駅名を簡略化する（例：「東京駅」「新宿駅」）</li>
                    <li>出発時刻を変更する</li>
                    <li>他の交通手段を選択する</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* テスト結果 */}
          {testResult && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">📊 テスト結果</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">📤 送信パラメータ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>出発地:</strong> {testResult.request.origin}</p>
                    <p><strong>目的地:</strong> {testResult.request.destinations?.[0]}</p>
                    <p><strong>交通手段:</strong> {testResult.request.travelMode}</p>
                    {testResult.departureTimeReadable !== "N/A" && (
                      <p><strong>出発時刻:</strong> {testResult.departureTimeReadable}</p>
                    )}
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">詳細なリクエスト（JSON）</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto mt-2">
                      {JSON.stringify(testResult.request, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>

              {testResult.status && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">📡 HTTP レスポンス</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`font-mono ${testResult.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                      <strong>ステータス:</strong> {testResult.status} {testResult.statusText}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">📋 APIレスポンス</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResult.data?.results?.[0] && (
                    <div className="space-y-2 text-sm mb-4">
                      <p><strong>距離:</strong> {testResult.data.results[0].distance || "N/A"}</p>
                      <p><strong>所要時間:</strong> {testResult.data.results[0].duration || "N/A"}</p>
                      {testResult.data.results[0].error && (
                        <p className="text-red-600"><strong>エラー:</strong> {testResult.data.results[0].error}</p>
                      )}
                    </div>
                  )}
                  <details>
                    <summary className="cursor-pointer text-sm font-medium">完全なレスポンス（JSON）</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96 mt-2">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>

              {testResult.error && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-red-600">❌ エラー情報</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-600">{testResult.error}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}