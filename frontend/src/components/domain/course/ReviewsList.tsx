import { useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Review, ReviewStats } from '@/services/api/review.api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ReviewsListProps {
  reviews: Review[];
  stats?: ReviewStats;
  currentUserId?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewsList({
  reviews,
  stats,
  currentUserId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onEdit,
  onDelete,
}: ReviewsListProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats?.rating_distribution) return null;

    const total = stats.total_reviews;
    if (total === 0) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.rating_distribution[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm text-gray-600">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Chưa có đánh giá nào cho khóa học này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Statistics */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.average_rating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 mb-2">
                {renderStars(Math.round(stats.average_rating))}
              </div>
              <div className="text-sm text-gray-600">
                Dựa trên {stats.total_reviews} đánh giá
              </div>
            </div>
            <div>{renderRatingDistribution()}</div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {review.user?.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {review.user?.first_name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {review.user?.first_name} {review.user?.last_name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {renderStars(review.rating)}
                    <span className="mx-1">•</span>
                    <span>
                      {review.created_at && !isNaN(new Date(review.created_at).getTime())
                        ? format(new Date(review.created_at), 'dd MMM yyyy', {
                            locale: vi,
                          })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              {currentUserId === review.user_id && (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(review)}
                    >
                      Sửa
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(review.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              )}
            </div>

            {review.comment && (
              <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                {review.comment}
              </p>
            )}

            {review.instructor_reply && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs">
                      GV
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-blue-600 mb-1">
                      Phản hồi từ giảng viên
                    </div>
                    <p className="text-gray-700 text-sm">
                      {review.instructor_reply}
                    </p>
                    {review.replied_at && !isNaN(new Date(review.replied_at).getTime()) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {format(
                          new Date(review.replied_at),
                          'dd MMM yyyy HH:mm',
                          { locale: vi }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Đang tải...
              </>
            ) : (
              'Tải thêm đánh giá'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

