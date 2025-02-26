"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPathBreadcrumb } from "@/lib/constants/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { For } from "react-haiku";

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getPathBreadcrumb(pathname);

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
        <Button variant="ghost">
          <UserCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
