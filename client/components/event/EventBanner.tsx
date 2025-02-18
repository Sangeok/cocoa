import Link from "next/link";
import Image from "next/image";

export default function EventBanner() {
  return (
    <section className="lg:w-1/3 w-full lg:m-6">
      <Link href="/event">
        <Image
          src="/images/event-banner.png"
          alt="event banner"
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </Link>
    </section>
  );
}
