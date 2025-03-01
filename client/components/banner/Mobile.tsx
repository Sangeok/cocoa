import Image from "next/image";
import { cn } from "@/lib/utils";

interface MobileBannerProps {
  imageUrl?: string;
  className?: string;
  onClick?: () => void;
}

export default function MobileBanner({
  imageUrl,
  className,
  onClick,
}: MobileBannerProps) {
  if (!imageUrl && process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className={cn(
        "block sm:hidden relative w-full h-[75px] bg-muted overflow-hidden cursor-pointer mb-4",
        "hover:opacity-95 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${imageUrl} 배너`}
          className="object-contain"
          sizes="(min-width: 375px) 375px, 100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-muted to-muted/80 border-2 border-red-500">
          <div className="text-center space-y-0">
            <p className="text-lg font-bold text-muted-foreground">375x75</p>
            <p className="text-base text-muted-foreground font-bold">
              모바일 광고
            </p>
            <p className="text-sm text-muted-foreground/80">
              배너를 등록하면 이 위치에 배너가 표시됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
