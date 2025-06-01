import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLogin from "@/components/AdminLogin";
import ArticleEditor from "@/components/ArticleEditor";
import { LogOut, FileText, BarChart3, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  const { data: statsData, refetch } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch admin stats");
      return response.json();
    },
    enabled: isLoggedIn,
  });

  const { data: articlesData, refetch: refetchArticles } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const response = await fetch("/api/articles?limit=100");
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
    enabled: isLoggedIn,
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    refetch();
    refetchArticles();
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
  };

  const handleUpdateComplete = () => {
    setEditingArticle(null);
    refetchArticles();
    refetch();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">管理画面</h2>
        <Button
          onClick={handleLogout}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </div>
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            統計情報
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            記事投稿
          </TabsTrigger>
          <TabsTrigger value="articleList" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            記事一覧
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="mt-6">
          {/* Usage Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">利用統計</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsData?.totalUsers || 0}
                </div>
                <div className="text-sm text-text-secondary">総利用者数</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-secondary">
                  {statsData?.monthlyQueries || 0}
                </div>
                <div className="text-sm text-text-secondary">今月の検索数</div>
              </div>
            </div>
          </div>
          
          {/* User Usage Table */}
          <div className="overflow-x-auto">
            <h4 className="font-semibold text-text-primary mb-3">ユーザー別利用状況</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">
                      ユーザーID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">
                      今月利用回数
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">
                      最終利用日
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {statsData?.userUsage?.map((usage: any, index: number) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-text-primary font-mono text-xs">
                        {usage.userId.substring(0, 12)}...
                      </td>
                      <td className="px-3 py-2 text-text-primary">
                        {usage.usageCount}回
                      </td>
                      <td className="px-3 py-2 text-text-secondary">
                        {usage.lastUsed}
                      </td>
                    </tr>
                  )) || []}
                  {(!statsData?.userUsage || statsData.userUsage.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-text-secondary">
                        利用データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="articles" className="mt-6">
          {editingArticle ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">記事編集</h3>
                <Button variant="outline" onClick={handleCancelEdit}>
                  編集を中止
                </Button>
              </div>
              <ArticleEditor 
                article={editingArticle} 
                onSave={handleUpdateComplete} 
                isEditing={true}
              />
            </div>
          ) : (
            <ArticleEditor onSave={() => refetch()} />
          )}
        </TabsContent>

        <TabsContent value="articleList" className="mt-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">記事一覧</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      記事タイトル
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      公開日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      最終更新日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articlesData?.articles?.map((article: any) => (
                    <tr key={article.id}>
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {article.title}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditArticle(article)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          編集
                        </Button>
                      </td>
                    </tr>
                  )) || []}
                  {(!articlesData?.articles || articlesData.articles.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                        記事がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
