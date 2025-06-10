import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import { useEffect, useRef } from "react";
import HomePage from "@/pages/HomePage";
import ArticlesPage from "@/pages/ArticlesPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import AdminPage from "@/pages/AdminPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/articles" component={ArticlesPage} />
      <Route path="/articles/:id" component={ArticleDetailPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminPage = location === '/admin';
  const footerAdRef = useRef<HTMLDivElement>(null);

  // Zucks Ad Network フッター広告の読み込み
  useEffect(() => {
    if (!isAdminPage) {
      // 既存のフッター広告スクリプトを確認
      const existingScript = document.querySelector('script[src*="f=693842"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://j.zucks.net.zimg.jp/j?f=693842';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('Zucks footer ad script loaded successfully');
      };
      
      script.onerror = () => {
        console.warn('Zucks footer ad script failed to load');
      };
      
      document.head.appendChild(script);

      return () => {
        const scripts = document.querySelectorAll('script[src*="f=693842"]');
        scripts.forEach(scriptElement => {
          if (document.head.contains(scriptElement)) {
            document.head.removeChild(scriptElement);
          }
        });
      };
    }
  }, [isAdminPage]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-neutral">
          <Navigation />
          <main className={`max-w-md md:max-w-4xl mx-auto p-4 ${isAdminPage ? 'pb-4' : 'pb-32'}`}>
            <Router />
          </main>
          
          {/* Zucks Ad Network Footer Advertisement - Hidden on Admin Page */}
          {!isAdminPage && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 max-w-md md:max-w-4xl mx-auto">
              <div 
                ref={footerAdRef}
                className="bg-white rounded-lg p-2 text-center min-h-[80px] flex items-center justify-center"
                id="zucks-footer-ad-container"
              >
                {/* Fallback content for development or ad loading failure */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-center text-white w-full">
                  <div className="text-xs text-blue-100 mb-1">広告</div>
                  <div className="font-semibold mb-1">新しいサービスをお試しください</div>
                  <div className="text-xs text-blue-100">今すぐクリックして詳細を確認</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
