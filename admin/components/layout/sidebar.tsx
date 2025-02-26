"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Users, BarChart3, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/lib/store/use-sidebar";
import Image from "next/image";
const sidebarItems = [
  { icon: Home, href: "/", label: "대시보드" },
  { icon: Package, href: "/products", label: "상품" },
  { icon: Users, href: "/customers", label: "고객" },
  { icon: BarChart3, href: "/analytics", label: "분석" },
  { icon: Settings, href: "/settings", label: "설정" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebar();

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background py-4 transition-all duration-300",
        isExpanded ? "w-[200px]" : "w-[60px]"
      )}
    >
      <div className="mb-8 flex px-4">
        <Button variant="ghost" size="icon" onClick={toggle}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-4 px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center rounded-md px-2 gap-2 hover:bg-accent",
                pathname === item.href && "bg-accent",
                !isExpanded && "justify-center"
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <Link
        href="https://coincoin.kr"
        className="flex justify-center gap-2 flex-col items-center p-4"
        target="_blank"
      >
        <Image src="/logo.webp" alt="logo" width={40} height={100} />
        <Image src="/cocoa_black.webp" alt="cocoa" width={100} height={30} />
      </Link>
    </div>
  );
}
