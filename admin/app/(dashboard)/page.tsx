'use client';

import { useUserStats } from "@/lib/hooks/use-user-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function Home() {
  const { data: stats, isLoading } = useUserStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dashboard. Here you can manage your products and view analytics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용자 통계</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.todayUsers ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  오늘 가입한 사용자
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  전체 사용자: {stats?.totalUsers?.toLocaleString() ?? 0}명
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
