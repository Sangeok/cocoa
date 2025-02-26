"use client";

import { useUserDetail } from "@/lib/hooks/use-user-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading } = useUserDetail(id);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">사용자 상세</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      ) : user ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">이름</h3>
            <p>{user.name}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              이메일
            </h3>
            <p>{user.email}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              가입 경로
            </h3>
            <p>{user.provider}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              가입일
            </h3>
            <p>{format(new Date(user.createdAt), "PPP", { locale: ko })}</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">사용자를 찾을 수 없습니다.</p>
      )}
    </div>
  );
}
