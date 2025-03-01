import Image from "next/image";
import { cn } from "@/lib/utils";

interface TabletBannerProps {
  imageUrl?: string;
  className?: string;
  onClick?: () => void;
}

export default function TabletBanner({
  imageUrl,
  className,
  onClick,
}: TabletBannerProps) {
  if (!imageUrl && process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className={cn(
        "hidden sm:block lg:hidden relative w-full h-[200px] bg-muted overflow-hidden cursor-pointer mb-4",
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
          sizes="(min-width: 768px) 768px, 100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-muted to-muted/80 border-2 border-red-500">
          {" "}
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-muted-foreground">768x100</p>
            <p className="text-xl text-muted-foreground font-bold">
              태블릿 광고
            </p>
            <p className="text-lg text-muted-foreground/80">
              배너를 등록하면 이 위치에 배너가 표시됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
