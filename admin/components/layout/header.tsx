"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getPathBreadcrumb } from "@/lib/constants/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { For } from "react-haiku";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/store/use-auth";
import { useProfile } from "@/lib/store/use-profile";
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getPathBreadcrumb(pathname);
  const { logout } = useAuth();
  const { profile } = useProfile();
  console.log(profile);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Breadcrumb>
          <For<string>
            each={breadcrumbs}
            render={(crumb, index) => (
              <BreadcrumbItem
                key={index}
                isLast={index === breadcrumbs.length - 1}
              >
                {crumb}
              </BreadcrumbItem>
            )}
          />
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="검색..." className="w-[280px] pl-8" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <UserCircle className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              프로필 설정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
