'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClientAPICall } from '@/lib/axios';
import { API_ROUTES } from '@/const/api';
import { ProjectSummary, Yield } from '@/types/yield';

const ProjectSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
    <div className="grid grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
    </div>
  </div>
);

export default function ProjectPage() {
  const { project } = useParams();
  const [data, setData] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await ClientAPICall.get<ProjectSummary>(
          API_ROUTES.YIELDS.PROJECT.url.replace(':name', project as string)
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch project data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (project) {
      fetchProjectData();
    }
  }, [project]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProjectSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500 dark:text-gray-400">
        {error || 'Project not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white capitalize">
        {data.project}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total TVL
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ${data.totalTvl.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Average APY
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {data.avgApy.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Chains
          </h3>
          <p className="text-lg text-gray-900 dark:text-white">
            {data.chains.join(', ')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Symbols
          </h3>
          <p className="text-lg text-gray-900 dark:text-white">
            {data.symbols.join(', ')}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                TVL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                APY
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Daily Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Weekly Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {data.yields.map((yieldData: Yield) => (
              <tr 
                key={yieldData.pool}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {yieldData.chain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {yieldData.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  ${Number(yieldData.tvlUsd).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {yieldData.apy ? `${Number(yieldData.apy).toFixed(2)}%` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {yieldData.apyPct1D ? `${Number(yieldData.apyPct1D).toFixed(2)}%` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {yieldData.apyPct7D ? `${Number(yieldData.apyPct7D).toFixed(2)}%` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
