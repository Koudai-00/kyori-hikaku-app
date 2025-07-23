export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">プライバシーポリシー</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              本プライバシーポリシーは、距離比較アプリ（以下、「本サービス」）のWebサイト（https://www.hikaku-map.com）およびモバイルアプリ版（iOS / Android）における、ユーザーの個人情報および関連データの取り扱いについて定めるものです。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第1条（収集する情報）</h2>
            <p className="text-gray-700 mb-2">本サービスでは、以下の情報を収集する場合があります。</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>利用者の位置情報（現在地からの距離比較やルート作成のため）</li>
              <li>IPアドレス、ブラウザ・端末情報、アクセス日時などのログ情報</li>
              <li>Cookie、広告ID（モバイルデバイス）等を含む端末識別情報</li>
              <li>Google AdSense（Web）および Google AdMob（モバイル）による広告配信に関する情報</li>
              <li>Google Analytics、Firebase Analytics による利用状況データ（匿名で収集）</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第2条（利用目的）</h2>
            <p className="text-gray-700 mb-2">収集した情報は、以下の目的で使用されます。</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>サービスの提供、改善、パーソナライズのため</li>
              <li>利用状況の分析および利便性向上のため</li>
              <li>広告配信の最適化および効果測定のため</li>
              <li>不正利用の防止、安全性の確保のため</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第3条（情報の第三者提供）</h2>
            <p className="text-gray-700 mb-2">本サービスでは、以下の外部サービスを通じて情報が収集・共有される場合があります。</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Google（Google Maps API, Google Analytics, Google AdSense, Google AdMob）</li>
              <li>Firebase（Firebase Analytics、クラッシュレポートなど）</li>
            </ul>
            <p className="text-gray-700 mb-4">
              これらサービスは、それぞれのプライバシーポリシー・利用規約に基づいて動作しています。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第4条（広告配信について）</h2>
            <p className="text-gray-700 mb-4">
              Googleや第三者配信事業者は、ユーザーの興味・関心に基づいた広告を表示するため、Cookieや広告IDなどを使用する場合があります。<br />
              ユーザーはGoogle広告設定ページなどからパーソナライズ広告の無効化が可能です。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第5条（アクセス解析について）</h2>
            <p className="text-gray-700 mb-2">当サービスでは、以下のアクセス解析サービスを利用しています。</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Google Analytics（Webサイト）</li>
              <li>Firebase Analytics（モバイルアプリ）</li>
            </ul>
            <p className="text-gray-700 mb-4">
              これらは、匿名でユーザーの行動を分析し、個人を特定することはありません。<br />
              Cookieや類似技術を使用することでデータ収集を行いますが、ユーザーのブラウザ設定で無効化することが可能です。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第6条（位置情報の取得について）</h2>
            <p className="text-gray-700 mb-4">
              モバイルアプリでは、ユーザーの現在地を使用する機能があります。<br />
              位置情報は、ユーザーの明示的な許可がある場合に限り、地図表示・距離比較・ルート作成に利用されます。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第7条（プライバシーポリシーの変更）</h2>
            <p className="text-gray-700 mb-4">
              本ポリシーは、法令変更やサービス内容の更新に応じて、ユーザーへの通知なく変更する場合があります。<br />
              変更後のプライバシーポリシーは、本ページに掲載された時点で効力を発揮します。
            </p>

            <p className="text-gray-500 mt-8">制定日：2025年7月</p>
          </div>
        </div>
      </div>
    </div>
  );
}