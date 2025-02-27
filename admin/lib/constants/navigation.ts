import { Home, Package, Users, BarChart3, Settings, Image } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  icon: LucideIcon;
  href: string;
  label: string;
  breadcrumb: string[];
}

export const navigationItems: NavigationItem[] = [
  {
    icon: Home,
    href: "/",
    label: "대시보드",
    breadcrumb: ["대시보드"],
  },
  {
    icon: Image,
    href: "/banners",
    label: "배너",
    breadcrumb: ["대시보드", "배너"],
  },
  {
    icon: Package,
    href: "/products",
    label: "상품",
    breadcrumb: ["대시보드", "상품"],
  },
  {
    icon: Users,
    href: "/customers",
    label: "고객",
    breadcrumb: ["대시보드", "고객"],
  },
  {
    icon: BarChart3,
    href: "/analytics",
    label: "분석",
    breadcrumb: ["대시보드", "분석"],
  },
  {
    icon: Settings,
    href: "/settings",
    label: "설정",
    breadcrumb: ["대시보드", "설정"],
  },
];

export const getPathBreadcrumb = (path: string): string[] => {
  const item = navigationItems.find((item) => item.href === path);
  return item?.breadcrumb ?? ["대시보드"];
};
