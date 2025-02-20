import Link from 'next/link';
import { AboutIcon, ApyIcon, StrategyIcon } from '../icons/GuideIcons';

interface GuideCardProps {
  href: string;
  title: string;
  description: string;
  icon: any;
}

export const GuideCard = ({ href, title, description, icon: Icon }: GuideCardProps) => (
  <Link href={href} className="block">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="text-blue-500 dark:text-blue-400">
          <Icon />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  </Link>
);

export const guideLinks = [
  {
    href: '/guide/defi/about',
    title: '디파이란?',
    description: '디파이의 기본 개념과 주요 특징을 알아보세요',
    icon: AboutIcon,
  },
  {
    href: '/guide/defi/apy',
    title: 'APY 이해하기',
    description: '디파이 수익률의 구성과 특징을 파악하세요',
    icon: ApyIcon,
  },
  {
    href: '/guide/defi/strategy',
    title: '투자 전략',
    description: '다양한 디파이 투자 전략을 확인하세요',
    icon: StrategyIcon,
  },
];

interface GuideCardsProps {
  excludeHref?: string;
}

export const GuideCards = ({ excludeHref }: GuideCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {guideLinks
      .filter(guide => guide.href !== excludeHref)
      .map(guide => (
        <GuideCard key={guide.href} {...guide} />
      ))}
  </div>
); 