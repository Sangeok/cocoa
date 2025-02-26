"use client";

import { useUserStats } from "@/lib/hooks/use-user-stats";
import { usePredictStats } from "@/lib/hooks/use-predict-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp } from "lucide-react";

export default function Home() {
  const { data: userStats, isLoading: isLoadingUsers } = useUserStats();
  const { data: predictStats, isLoading: isLoadingPredicts } = usePredictStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용자 통계</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {userStats?.todayUsers ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  오늘 가입한 사용자
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  전체 사용자: {userStats?.totalUsers?.toLocaleString() ?? 0}명
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">가격 예측 통계</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingPredicts ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {parseInt(predictStats?.todayPredicts ?? "0").toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  오늘 예측 게임 플레이
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  전체 플레이: {parseInt(predictStats?.totalPredicts ?? "0").toLocaleString()}회
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
