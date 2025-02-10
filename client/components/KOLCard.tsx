import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { KOL } from "@/types/kol";

export default function KOLCard({
  name,
  link,
  followers,
  image,
  keywords,
  selfIntroduction,
  registeredAt,
}: KOL) {
  return (
    <div className="block bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <Image
              src={image}
              alt={name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              팔로워 {formatNumber(followers)}명
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-bold">
          {selfIntroduction}
        </p>
        <p className="flex flex-wrap gap-2">
          {keywords.map((el) => (
            <span
              key={el}
              className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm"
            >
              {el}
            </span>
          ))}
        </p>
        <div className="flex gap-2 justify-between items-center">
          <div className="flex items-center gap-3">
            {link.telegram && (
              <Link
                href={link.telegram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/icons/telegram.svg"
                  alt="telegram"
                  width={28}
                  height={28}
                />
              </Link>
            )}
            {link.youtube && (
              <Link
                href={link.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/icons/youtube.svg"
                  alt="youtube"
                  width={32}
                  height={32}
                />
              </Link>
            )}
            {link.x && (
              <Link href={link.x} target="_blank" rel="noopener noreferrer">
                <Image src="/icons/x.svg" alt="x" width={32} height={32} />
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            등록일: {registeredAt}
          </p>
        </div>
      </div>
    </div>
  );
}
