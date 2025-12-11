import { useState } from 'react';
import { Star, ThumbsUp, Filter, ChevronDown, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { ReviewModal } from './ReviewModal';

/**
 * ReviewsTab Component
 * 
 * Tab đánh giá khóa học với:
 * - RatingSummary: Thống kê tổng quan đánh giá
 * - ReviewListContainer: Danh sách reviews với filter và sorting
 * 
 * TODO: Cần triển khai API:
 * - GET /api/courses/:courseId/reviews - Lấy danh sách reviews
 * - GET /api/courses/:courseId/reviews/summary - Lấy thống kê đánh giá
 * - POST /api/courses/:courseId/reviews - Tạo review mới
 * - PUT /api/reviews/:reviewId - Cập nhật review
 * - DELETE /api/reviews/:reviewId - Xóa review
 * - POST /api/reviews/:reviewId/helpful - Đánh dấu review hữu ích
 */

// ============================================================================
// MOCK DATA - TODO: Replace with API calls
// ============================================================================

/**
 * TODO: API Response Type for Review Summary
 * GET /api/courses/:courseId/reviews/summary
 */
interface ReviewSummary {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

/**
 * TODO: API Response Type for Review
 * GET /api/courses/:courseId/reviews
 */
interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    helpfulCount: number;
    isHelpful?: boolean; // Current user đã đánh dấu helpful chưa
}

// Mock summary data
// TODO: Replace with useQuery hook calling reviewApi.getSummary(courseId)
const mockReviewSummary: ReviewSummary = {
    averageRating: 4.6,
    totalReviews: 1247,
    ratingDistribution: {
        5: 892,
        4: 234,
        3: 78,
        2: 28,
        1: 15,
    },
};

// Mock reviews data
// TODO: Replace with useQuery hook calling reviewApi.getReviews(courseId, { page, limit, rating, sort })
const mockReviews: Review[] = [
    {
        id: '1',
        userId: 'user-1',
        userName: 'Nguyễn Văn An',
        rating: 5,
        title: 'Khóa học tuyệt vời!',
        content: 'Nội dung rất chi tiết và dễ hiểu. Giảng viên giải thích rõ ràng, có nhiều ví dụ thực tế. Tôi đã học được rất nhiều kiến thức mới và áp dụng ngay vào công việc.',
        createdAt: '2024-12-01T10:30:00Z',
        helpfulCount: 42,
        isHelpful: false,
    },
    {
        id: '2',
        userId: 'user-2',
        userName: 'Trần Thị Bình',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binhi',
        rating: 4,
        title: 'Khóa học chất lượng',
        content: 'Nhìn chung khóa học rất tốt, kiến thức được trình bày logic. Tuy nhiên, một số phần hơi nhanh, cần xem lại nhiều lần. Mong có thêm bài tập thực hành.',
        createdAt: '2024-11-28T14:20:00Z',
        helpfulCount: 18,
        isHelpful: true,
    },
    {
        id: '3',
        userId: 'user-3',
        userName: 'Lê Hoàng Cường',
        rating: 5,
        title: 'Đáng đồng tiền bát gạo',
        content: 'Đây là một trong những khóa học hay nhất mà tôi từng học. Giảng viên có kinh nghiệm thực tế, chia sẻ nhiều tips hay. Support rất nhiệt tình.',
        createdAt: '2024-11-25T09:15:00Z',
        helpfulCount: 56,
        isHelpful: false,
    },
    {
        id: '4',
        userId: 'user-4',
        userName: 'Phạm Minh Đức',
        rating: 3,
        title: 'Tạm được',
        content: 'Nội dung ổn nhưng video chất lượng không cao lắm. Một số phần cần cập nhật vì công nghệ đã thay đổi. Hy vọng khóa học sẽ được update thường xuyên hơn.',
        createdAt: '2024-11-20T16:45:00Z',
        helpfulCount: 8,
        isHelpful: false,
    },
    {
        id: '5',
        userId: 'user-5',
        userName: 'Hoàng Thị Mai',
        rating: 5,
        title: 'Xuất sắc!',
        content: 'Khóa học vượt xa mong đợi của tôi. Từ người mới bắt đầu, giờ tôi đã tự tin làm được các dự án cơ bản. Cảm ơn giảng viên rất nhiều!',
        createdAt: '2024-11-15T11:00:00Z',
        helpfulCount: 31,
        isHelpful: false,
    },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * StarRating - Hiển thị sao đánh giá
 */
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClasses[size]} ${star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : star <= rating + 0.5
                            ? 'text-yellow-400 fill-yellow-400/50'
                            : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );
}

/**
 * RatingBar - Thanh progress cho từng mức rating
 */
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-12">
                <span className="text-sm text-gray-600">{stars}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
        </div>
    );
}

/**
 * RatingSummary - Phần thống kê tổng quan đánh giá
 * 
 * TODO: Integrate with API
 * const { data: summary } = useQuery({
 *   queryKey: ['course-review-summary', courseId],
 *   queryFn: () => reviewApi.getSummary(courseId),
 * });
 */
function RatingSummary({ summary }: { summary: ReviewSummary }) {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Đánh giá của học viên</h3>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Average rating */}
                    <div className="flex flex-col items-center justify-center text-center md:min-w-[160px]">
                        <span className="text-5xl font-bold text-gray-900">{summary.averageRating.toFixed(1)}</span>
                        <div className="mt-2">
                            <StarRating rating={summary.averageRating} size="lg" />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {summary.totalReviews.toLocaleString()} đánh giá
                        </p>
                    </div>

                    {/* Right: Rating distribution */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                            <RatingBar
                                key={stars}
                                stars={stars}
                                count={summary.ratingDistribution[stars as keyof typeof summary.ratingDistribution]}
                                total={summary.totalReviews}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * ReviewCard - Card hiển thị một review
 */
function ReviewCard({ review, onHelpful }: { review: Review; onHelpful: (reviewId: string) => void }) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {review.userAvatar ? (
                        <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h4 className="font-medium text-gray-900">{review.userName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    {review.title && (
                        <h5 className="font-medium text-gray-800 mt-2">{review.title}</h5>
                    )}

                    {/* Content */}
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4">
                        <button
                            onClick={() => onHelpful(review.id)}
                            className={`flex items-center gap-1.5 text-sm transition-colors ${review.isHelpful
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <ThumbsUp className={`w-4 h-4 ${review.isHelpful ? 'fill-blue-600' : ''}`} />
                            <span>Hữu ích ({review.helpfulCount})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * ReviewListContainer - Container chứa filter và danh sách reviews
 * 
 * TODO: Integrate with API for pagination and filtering
 * const { data: reviews, isLoading } = useQuery({
 *   queryKey: ['course-reviews', courseId, { page, rating: ratingFilter, sort: sortBy }],
 *   queryFn: () => reviewApi.getReviews(courseId, { page, limit: 10, rating: ratingFilter, sort: sortBy }),
 * });
 */
function ReviewListContainer({
    reviews,
    onHelpful,
}: {
    reviews: Review[];
    onHelpful: (reviewId: string) => void;
}) {
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Filter and sort reviews (client-side for mock data)
    // TODO: When API is ready, these filters should be passed to API
    const filteredReviews = reviews
        .filter((review) => (ratingFilter ? review.rating === ratingFilter : true))
        .sort((a, b) => {
            if (sortBy === 'helpful') {
                return b.helpfulCount - a.helpfulCount;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return (
        <Card>
            <CardContent className="p-6">
                {/* Header with filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Đánh giá ({reviews.length})
                    </h3>

                    <div className="flex items-center gap-3">
                        {/* Rating Filter */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsFilterOpen(!isFilterOpen);
                                    setIsSortOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span>{ratingFilter ? `${ratingFilter} sao` : 'Tất cả'}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <button
                                        onClick={() => {
                                            setRatingFilter(null);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${!ratingFilter ? 'text-blue-600 font-medium' : 'text-gray-700'
                                            }`}
                                    >
                                        Tất cả
                                    </button>
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => {
                                                setRatingFilter(star);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${ratingFilter === star ? 'text-blue-600 font-medium' : 'text-gray-700'
                                                }`}
                                        >
                                            {star} <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsSortOpen(!isSortOpen);
                                    setIsFilterOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <span>{sortBy === 'newest' ? 'Mới nhất' : 'Hữu ích nhất'}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {isSortOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <button
                                        onClick={() => {
                                            setSortBy('newest');
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === 'newest' ? 'text-blue-600 font-medium' : 'text-gray-700'
                                            }`}
                                    >
                                        Mới nhất
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy('helpful');
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === 'helpful' ? 'text-blue-600 font-medium' : 'text-gray-700'
                                            }`}
                                    >
                                        Hữu ích nhất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews list */}
                {filteredReviews.length > 0 ? (
                    <div className="space-y-6">
                        {filteredReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} onHelpful={onHelpful} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có đánh giá nào</p>
                        {ratingFilter && (
                            <button
                                onClick={() => setRatingFilter(null)}
                                className="text-blue-600 text-sm mt-2 hover:underline"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}

                {/* Load more button */}
                {/* TODO: Implement pagination with API
         * - Add page state
         * - Call API with next page
         * - Append results to existing reviews
         */}
                {filteredReviews.length > 0 && (
                    <div className="mt-8 text-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                // TODO: Load more reviews from API
                                // setPage(page + 1);
                                toast.success('Tính năng đang được phát triển');
                            }}
                        >
                            Xem thêm đánh giá
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ReviewsTabProps {
    courseId: string;
    isEnrolled: boolean;
}

/**
 * ReviewsTab - Main tab component for reviews
 * 
 * TODO: Full API Integration Plan:
 * 
 * 1. Create review.api.ts:
 *    - getReviews(courseId, params): GET /api/courses/:courseId/reviews
 *    - getSummary(courseId): GET /api/courses/:courseId/reviews/summary
 *    - createReview(courseId, data): POST /api/courses/:courseId/reviews
 *    - updateReview(reviewId, data): PUT /api/reviews/:reviewId
 *    - deleteReview(reviewId): DELETE /api/reviews/:reviewId
 *    - markHelpful(reviewId): POST /api/reviews/:reviewId/helpful
 * 
 * 2. Create useReviews.ts hook:
 *    - useCourseReviews(courseId, filters)
 *    - useReviewSummary(courseId)
 *    - useCreateReview()
 *    - useMarkHelpful()
 * 
 * 3. Backend API:
 *    - Create reviews table with: id, course_id, user_id, rating, title, content, helpful_count, created_at
 *    - Create review_helpful table for tracking helpful votes
 *    - Implement review CRUD endpoints
 *    - Add validation: User must be enrolled to review
 *    - Add constraint: One review per user per course
 */
export function ReviewsTab({ courseId, isEnrolled }: ReviewsTabProps) {
    // State for review modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // TODO: Replace mock data with API calls
    // const { data: summary, isLoading: isSummaryLoading } = useReviewSummary(courseId);
    // const { data: reviews, isLoading: isReviewsLoading } = useCourseReviews(courseId, filters);
    const summary = mockReviewSummary;
    const reviews = mockReviews;

    /**
     * TODO: Get current user info from auth
     * const { user } = useAuth();
     * const userName = user?.full_name || user?.username || 'Học viên';
     */
    const mockUserName = 'Trần Kim Hương'; // Mock user name

    /**
     * TODO: Implement with API
     * const markHelpfulMutation = useMutation({
     *   mutationFn: (reviewId: string) => reviewApi.markHelpful(reviewId),
     *   onSuccess: () => {
     *     queryClient.invalidateQueries(['course-reviews', courseId]);
     *   },
     * });
     */
    const handleMarkHelpful = (reviewId: string) => {
        // TODO: Call API to mark review as helpful
        console.log('Mark helpful:', reviewId);
        toast.success('Đã đánh dấu hữu ích');
    };

    return (
        <div className="space-y-8">
            {/* Rating Summary Section */}
            <RatingSummary summary={summary} />

            {/* Leave a Rating Button - Only for enrolled users */}
            {/* TODO: Also check if user has already reviewed this course
             * const { data: myReview } = useQuery({
             *   queryKey: ['my-course-review', courseId],
             *   queryFn: () => reviewApi.getMyReview(courseId),
             * });
             * - If myReview exists, show "Edit your review" button instead
             */}
            {isEnrolled && (
                <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    <Star className="w-5 h-5 text-gray-400" />
                    <span>Leave a rating</span>
                </button>
            )}

            {/* Reviews List Section */}
            <ReviewListContainer reviews={reviews} onHelpful={handleMarkHelpful} />

            {/* Review Modal */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                courseId={courseId}
                userName={mockUserName}
            />
        </div>
    );
}

export default ReviewsTab;
