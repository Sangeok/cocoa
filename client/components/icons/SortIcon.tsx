import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface SortIconProps {
  direction: "asc" | "desc" | null;
}

export default function SortIcon({ direction }: SortIconProps) {
  if (!direction) return null;
  
  return direction === "asc" ? (
    <ChevronUpIcon className="h-4 w-4" />
  ) : (
    <ChevronDownIcon className="h-4 w-4" />
  );
} 