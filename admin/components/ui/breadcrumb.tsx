import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  isLast?: boolean;
}

export function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center space-x-1.5", className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, children, isLast, ...props }: BreadcrumbItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </span>
      {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
} 