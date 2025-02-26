"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useProfile } from "@/lib/store/use-profile";

export default function ProfilePage() {
  const { profile } = useProfile();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="text-muted-foreground">
          관리자 정보를 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">이름</h3>
          <p>{profile.name}</p>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">이메일</h3>
          <p>{profile.email}</p>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">
            전화번호
          </h3>
          <p>{profile.phoneNumber || "-"}</p>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">가입일</h3>
          <p>{format(new Date(profile.createdAt), "PPP", { locale: ko })}</p>
        </div>
      </div>
    </div>
  );
}
