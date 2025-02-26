'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const pathMap: Record<string, string[]> = {
  '/': ['Dashboard'],
  '/products': ['Dashboard', 'Products'],
  '/customers': ['Dashboard', 'Customers'],
  '/analytics': ['Dashboard', 'Analytics'],
  '/settings': ['Dashboard', 'Settings'],
};

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = pathMap[pathname] || ['Dashboard'];

  return (
    <div className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb} className="flex items-center gap-2">
            {i > 0 && <span>/</span>}
            <span>{crumb}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="검색..."
            className="w-[280px] pl-8"
          />
        </div>
        <Button variant="ghost">
          <UserCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 