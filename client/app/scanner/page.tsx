"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import {
  ContractSearchResponse,
  SearchParams,
  ProjectSummary,
  TopResponse,
  TopProject,
} from "@/types/scanner";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";

const TableSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden animate-pulse">
    <div className="min-w-full">
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface TopContractsTableProps {
  contracts: TopProject[];
  title: string;
  type: "secure" | "risky";
}

const TopContractsTable = ({
  contracts,
  title,
  type,
}: TopContractsTableProps) => {
  const router = useRouter();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                순위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                점수
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {contracts.map((contract) => (
              <tr
                key={contract.address}
                onClick={() => router.push(`/scanner/${contract.address}`)}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {contract.rank}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {contract.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {contract.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {contract.score.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface RiskTypeCardProps {
  icon: string;
  title: string;
  description: string;
}

const RiskTypeCard = ({ icon, title, description }: RiskTypeCardProps) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex items-start gap-4">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 flex items-center justify-center bg-blue-50 dark:bg-blue-950 rounded-lg">
        <Image
          src={icon}
          alt={title}
          width={24}
          height={24}
          className="text-blue-600 dark:text-blue-400"
        />
      </div>
    </div>
    <div>
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default function ScannerPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ProjectSummary[]>([]);
  const [totalContracts, setTotalContracts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [topSecure, setTopSecure] = useState<TopProject[]>([]);
  const [topRisky, setTopRisky] = useState<TopProject[]>([]);
  const [isLoadingTop, setIsLoadingTop] = useState(true);

  const handleSearch = async (searchQuery?: string, page: number = 1) => {
    setIsLoading(true);
    try {
      const params: SearchParams = {
        q: searchQuery || "",
        page,
        per_page: 10,
      };

      const response = await ClientAPICall.get<ContractSearchResponse>(
        API_ROUTES.SCAMSCANNER.CONTRACT_SEARCH.url,
        { params }
      );
      setSearchResults(response.data.projects);
      setTotalContracts(response.data.total);
      setTotalPages(response.data.total_pages);
      setCurrentPage(response.data.page);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    handleSearch(debouncedSearchTerm, 1);
    setCurrentPage(1); // 검색어 변경시 첫 페이지로
  }, [debouncedSearchTerm]);

  const handlePageChange = (page: number) => {
    handleSearch(searchTerm, page);
  };

  const handleProjectClick = (address: string) => {
    router.push(`/scanner/${address}`);
  };

  // Fetch top contracts
  useEffect(() => {
    const fetchTopContracts = async () => {
      setIsLoadingTop(true);
      try {
        const [secureResponse, riskyResponse] = await Promise.all([
          ClientAPICall.get<TopResponse>(API_ROUTES.SCAMSCANNER.TOP.url, {
            params: { type: "secure" },
          }),
          ClientAPICall.get<TopResponse>(API_ROUTES.SCAMSCANNER.TOP.url, {
            params: { type: "risky" },
          }),
        ]);
        setTopSecure(secureResponse.data);
        setTopRisky(riskyResponse.data);
      } catch (error) {
        console.error("Failed to fetch top contracts:", error);
      } finally {
        setIsLoadingTop(false);
      }
    };

    fetchTopContracts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white text-left md:text-center">
        컨트랙트 스캐너
      </h1>
      <div className="mb-8">
        <h2 className="text-sm md:text-xl font-semibold mb-8 text-gray-900 dark:text-white md:text-center text-left">
          블록체인 상의 코인과 토큰의 위험성을 다음 4가지 측면에서 분석합니다
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RiskTypeCard
            icon="/icons/liquidity.svg"
            title="유동성 위험"
            description="토큰의 거래 가능성과 시장 안정성을 평가합니다"
          />
          <RiskTypeCard
            icon="/icons/sale.svg"
            title="판매 제한 위험"
            description="토큰 판매에 대한 제한이나 불공정한 조건 존재 여부를 확인합니다"
          />
          <RiskTypeCard
            icon="/icons/distribution.svg"
            title="토큰 분배 위험"
            description="토큰 보유 집중도와 분배의 형평성을 분석합니다"
          />
          <RiskTypeCard
            icon="/icons/code.svg"
            title="소스 코드 위험"
            description="스마트 컨트랙트 코드의 안전성과 신뢰성을 검증합니다"
          />
        </div>
      </div>

      {/* Top Contracts */}
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        상위 컨트랙트
      </h2>
      {isLoadingTop ? (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <TableSkeleton />
          <TableSkeleton />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <TopContractsTable
            contracts={topSecure}
            title="🛡️ 가장 안전한 컨트랙트"
            type="secure"
          />
          <TopContractsTable
            contracts={topRisky}
            title="⚠️ 위험 주의 컨트랙트"
            type="risky"
          />
        </div>
      )}

      {/* Total Contracts Info */}
      <div className="mb-4 text-gray-600 dark:text-gray-300">
        총 {totalContracts.toLocaleString()}개의 컨트랙트가 분석 가능합니다.
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="컨트랙트 이름 또는 주소로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <TableSkeleton />
        ) : searchResults.length > 0 ? (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      순위
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      점수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      상세
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {searchResults.map((project) => (
                    <tr
                      key={project.address}
                      onClick={() => handleProjectClick(project.address)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                        {project.rank}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {project.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {project.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          토큰: {project.token.toFixed(1)} | 코드:{" "}
                          {project.code.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">
                        자세히 보기 →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                         text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                이전
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                         text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                다음
              </button>
            </div>
          </>
        ) : searchTerm ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            검색 결과가 없습니다
          </div>
        ) : null}
      </div>
    </div>
  );
}
