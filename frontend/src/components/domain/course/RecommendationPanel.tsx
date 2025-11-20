import React from 'react';
import { Loader, TrendingUp } from 'lucide-react';
import { useRecommendations, useTrendingCourses } from '@/services/api/search.api';
import { useTranslation } from 'react-i18next';

interface RecommendationPanelProps {
  userId?: string;
  onSelectCourse?: (courseId: string) => void;
  className?: string;
}

/**
 * Recommendation Panel Component
 * Displays recommended courses based on user interests
 */
export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  userId,
  onSelectCourse,
  className = ''
}) => {
  const { t } = useTranslation();
  const { data: recommendations = [], isLoading: isLoadingRec } = useRecommendations(userId);
  const { data: trending = [], isLoading: isLoadingTrend } = useTrendingCourses(8);

  if (isLoadingRec || isLoadingTrend) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recommended For You */}
      {recommendations.length > 0 && (
        <section aria-labelledby="recommendations-heading">
          <h2 id="recommendations-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Recommended For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectCourse?.(item.courseId)}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View ${item.title} course`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                    {Math.round(item.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                <span className="text-xs text-gray-500 capitalize">
                  {item.reason.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trending.length > 0 && (
        <section aria-labelledby="trending-heading">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 id="trending-heading" className="text-lg font-semibold text-gray-900">
              Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trending.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectCourse?.(item.courseId)}
                className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label={`View ${item.title} trending course`}
              >
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && trending.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('common.error')} - No recommendations available</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationPanel;
