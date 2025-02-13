import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";

interface CoinHeaderProps {
  symbol: string;
  koreanName: string;
}

export default function CoinHeader({ symbol, koreanName }: CoinHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Image
          src={`${UPBIT_STATIC_IMAGE_URL}/${symbol.split("-")[0]}.png`}
          alt={symbol.split("-")[0]}
          width={20}
          height={20}
        />
        {koreanName}({symbol.split("-")[0]})
      </h1>
    </div>
  );
} 