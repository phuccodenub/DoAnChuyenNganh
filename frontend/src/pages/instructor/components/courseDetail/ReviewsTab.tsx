import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Review } from './types';

interface ReviewsTabProps {
    reviews: Review[];
    onReplyReview: (reviewId: string, replyText: string) => void;
}

/**
 * ReviewsTab Component
 * 
 * Hiển thị và quản lý đánh giá:
 * - Xem đánh giá từ học viên
 * - Trả lời đánh giá
 * 
 * TODO: API call - GET /api/instructor/courses/:courseId/reviews
 * TODO: API call - POST /api/instructor/reviews/:reviewId/reply
 */
export function ReviewsTab({ reviews, onReplyReview }: ReviewsTabProps) {
    const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    /**
     * Render star rating component inline
     * @param rating - Số sao (0-5)
     * @returns JSX.Element
     */
    const renderStars = (rating: number): JSX.Element => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <div
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        ★
                    </div>
                ))}
            </div>
        );
    };

    const handleReply = (reviewId: string) => {
        if (replyText.trim()) {
            onReplyReview(reviewId, replyText);
            setReplyingReviewId(null);
            setReplyText('');
        }
    };

    const handleCancelReply = () => {
        setReplyingReviewId(null);
        setReplyText('');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Đánh giá khóa học</h2>
                    <p className="text-sm text-gray-500">{reviews.length} đánh giá</p>
                </div>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                        {review.user_name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">{review.user_name}</p>
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-gray-700 mt-3">{review.comment}</p>

                                        {/* Reply Section */}
                                        {review.reply ? (
                                            <div className="mt-4 pl-4 border-l-2 border-blue-200 bg-blue-50 p-3 rounded-r-lg">
                                                <p className="text-sm font-medium text-blue-700">Phản hồi của bạn:</p>
                                                <p className="text-sm text-gray-700 mt-1">{review.reply}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(review.replied_at!).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        ) : replyingReviewId === review.id ? (
                                            <div className="mt-4 space-y-3">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Nhập phản hồi của bạn..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" onClick={() => handleReply(review.id)}>
                                                        Gửi phản hồi
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={handleCancelReply}
                                                    >
                                                        Hủy
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setReplyingReviewId(review.id)}
                                                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Trả lời đánh giá
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default ReviewsTab;
