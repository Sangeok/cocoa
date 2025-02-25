import Link from "next/link";
import Image from "next/image";

export default function EventBanner() {
  return (
    <Link href="/event" className="aspect-square">
      <Image
        src="/images/event-banner.png"
        alt="event banner"
        width={400}
        height={400}
        className="w-full h-full object-contain"
      />
    </Link>
  );
}
