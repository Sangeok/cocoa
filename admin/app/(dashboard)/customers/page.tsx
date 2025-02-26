"use client";

import { useUserList } from "@/lib/hooks/use-user-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserList(page);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground">
          사용자 목록을 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="이메일 또는 이름으로 검색" className="pl-9" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>가입 경로</TableHead>
              <TableHead>가입일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.users.map((user) => (
                  <TableRow
                    key={user.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      "focus:bg-muted/50 focus:outline-none"
                    )}
                    onClick={() => router.push(`/customers/${user.id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/customers/${user.id}`);
                      }
                    }}
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.provider}</TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "PPP", { locale: ko })}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          이전
        </Button>
        <div className="text-sm">
          {page}{" "}
          {data?.pagination && `/ ${data.pagination.totalPages}`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={data?.pagination && page >= data.pagination.totalPages}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
