"use client";

import { useEffect, useState, use } from "react";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import { ContractAnalysis } from "@/types/scanner";
import Image from "next/image";

interface SocialLinkProps {
  url: string;
  icon: string;
  name: string;
}

const SocialLink = ({ url, icon, name }: SocialLinkProps) => {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
    >
      <Image src={icon} alt={name} width={20} height={20} />
      <span>{name}</span>
    </a>
  );
};

const RiskScoreIndicator = ({ score }: { score: number }) => {
  const getColorClass = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getColorClass(score)}`} />
      <span className="text-lg font-semibold">{score.toFixed(1)}</span>
    </div>
  );
};

const ContractSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="mb-8">
      <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    {/* Overall Score Skeleton */}
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
      <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="flex items-center gap-4">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    {/* Risk Categories Skeleton */}
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-lg shadow p-6"
        >
          <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Contract Details Skeleton */}
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
      <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-6 bg-gray-200 dark:bg-gray-700 rounded"
          ></div>
        ))}
      </div>
    </div>
  </div>
);

interface ExternalLinkProps {
  href: string;
  icon: string;
  name: string;
}

const ExternalLink = ({ href, icon, name }: ExternalLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
  >
    <Image src={icon} alt={name} width={100} height={32} />
    <span className="text-sm line-clamp-1 break-all">{href}</span>
  </a>
);

export default function ContractPage({
  params,
}: {
  params: Promise<{ contract: string }>;
}) {
  const resolvedParams = use(params);
  const [contract, setContract] = useState<ContractAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await ClientAPICall.get<ContractAnalysis>(
          API_ROUTES.SCAMSCANNER.CONTRACT_DETAIL.url.replace(
            ":address",
            resolvedParams.contract
          )
        );
        setContract(response.data);
      } catch (error) {
        console.error("Failed to fetch contract:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [resolvedParams.contract]);

  if (isLoading) {
    return <ContractSkeleton />;
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        컨트랙트를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {contract.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 line-clamp-1 break-all mb-2">
          {contract.contractDetails.address}
        </p>
        <div className="flex items-center gap-4">
          <ExternalLink
            href={`https://www.coingecko.com/en/coins/${contract.contractDetails.address}`}
            icon="/services/coingecko.svg"
            name="CoinGecko"
          />
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          전체 위험도 평가
        </h2>
        <div className="flex items-center gap-4">
          <RiskScoreIndicator score={contract.overallScore} />
          <span className="text-gray-600 dark:text-gray-300">
            / {contract.maxScore} 점
          </span>
        </div>
      </div>

      {/* Risk Categories */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {contract.riskIndicators.map((category) => (
          <div
            key={category.type}
            className="bg-white dark:bg-gray-900 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.type}
              </h3>
              <RiskScoreIndicator score={category.score} />
            </div>
            {category.indicators.length > 0 && (
              <ul className="space-y-3">
                {category.indicators.map((indicator, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {indicator.name}
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          indicator.severity === "HIGH"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : indicator.severity === "WARNING"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {indicator.severity}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {indicator.description_ko}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Contract Details */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          컨트랙트 정보
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">배포일:</span>{" "}
              {contract.contractDetails.deployedDate}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">수명:</span>{" "}
              {contract.contractDetails.lifetime}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">체인:</span>{" "}
              {contract.contractDetails.chain}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">토큰 타입:</span>{" "}
              {contract.contractDetails.tokenType}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">총 공급량:</span>{" "}
              {contract.contractDetails.tokenTotalSupply}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">현재 가격:</span>{" "}
              {contract.contractDetails.currentPrice}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">USD 가격:</span>{" "}
              {contract.contractDetails.tokenPriceUSD || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          소셜 링크
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries({
            telegram: {
              url: contract.contractDetails.telegram,
              icon: "/icons/telegram.svg",
              name: "Telegram",
            },
            twitter: {
              url: contract.contractDetails.twitter,
              icon: "/icons/x.svg",
              name: "X (Twitter)",
            },
            website: {
              url: contract.contractDetails.website,
              icon: "/icons/web.svg",
              name: "Website",
            },
            github: {
              url: contract.contractDetails.github,
              icon: "/icons/github.svg",
              name: "GitHub",
            },
          }).filter(([_, data]) => data.url).length > 0 ? (
            <>
              <SocialLink
                url={contract.contractDetails.telegram}
                icon="/icons/telegram.svg"
                name="Telegram"
              />
              <SocialLink
                url={contract.contractDetails.twitter}
                icon="/icons/x.svg"
                name="X (Twitter)"
              />
              <SocialLink
                url={contract.contractDetails.website}
                icon="/icons/web.svg"
                name="Website"
              />
              <SocialLink
                url={contract.contractDetails.github}
                icon="/icons/github.svg"
                name="GitHub"
              />
            </>
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
              공개된 소셜 링크가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
