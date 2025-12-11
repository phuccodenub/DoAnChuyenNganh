import { useState } from 'react';
import { Star, X, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

/**
 * ReviewModal Component
 * 
 * Modal đánh giá khóa học theo 3 bước:
 * 1. Step 1: Select Rating - Chọn số sao đánh giá
 * 2. Step 2: Write Review - Viết nhận xét chi tiết
 * 3. Step 3: Thank You - Xác nhận và chia sẻ
 * 
 * TODO: Cần tích hợp API:
 * - POST /api/courses/:courseId/reviews - Tạo review mới
 * - PUT /api/reviews/:reviewId - Cập nhật review (nếu đã có review)
 * - GET /api/courses/:courseId/reviews/my-review - Lấy review của user hiện tại
 */

// ============================================================================
// TYPES
// ============================================================================

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName?: string;
    /** Mock user info - TODO: Replace with useAuth() */
    userName?: string;
}

/**
 * TODO: API Request Type for Create/Update Review
 * POST /api/courses/:courseId/reviews
 * PUT /api/reviews/:reviewId
 */
interface CreateReviewData {
    rating: number;
    content: string;
}

// ============================================================================
// RATING LABELS
// ============================================================================

const RATING_LABELS: Record<number, string> = {
    1: 'Rất tệ',
    2: 'Không hài lòng',
    3: 'Bình thường',
    4: 'Good / Amazing',
    5: 'Xuất sắc / Tuyệt vời',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * InteractiveStarRating - Cho phép user chọn rating bằng cách click vào sao
 */
function InteractiveStarRating({
    rating,
    onRatingChange,
    size = 'lg',
    disabled = false,
}: {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: 'md' | 'lg' | 'xl';
    disabled?: boolean;
}) {
    const [hoverRating, setHoverRating] = useState<number>(0);

    const sizeClasses = {
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-12 h-12',
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRatingChange(star)}
                    onMouseEnter={() => !disabled && setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`transition-transform ${!disabled ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                >
                    <Star
                        className={`${sizeClasses[size]} transition-colors ${star <= displayRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-yellow-400 stroke-yellow-400'
                            }`}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
}

/**
 * Step1SelectRating - Bước 1: Chọn số sao
 */
function Step1SelectRating({
    rating,
    onRatingChange,
    onNext,
}: {
    rating: number;
    onRatingChange: (rating: number) => void;
    onNext: () => void;
}) {
    return (
        <div className="flex flex-col items-center py-8 px-6">
            <h2 className="text-2xl font-bold text-gray-900 italic mb-8">
                How would you rate this course?
            </h2>

            <p className="text-gray-600 font-medium mb-4">Select Rating</p>

            <InteractiveStarRating
                rating={rating}
                onRatingChange={(newRating) => {
                    onRatingChange(newRating);
                    // Auto advance to next step after selecting
                    setTimeout(() => onNext(), 300);
                }}
                size="xl"
            />

            {rating > 0 && (
                <p className="mt-4 text-gray-600">
                    {RATING_LABELS[rating]}
                </p>
            )}
        </div>
    );
}

/**
 * Step2WriteReview - Bước 2: Viết nhận xét
 */
function Step2WriteReview({
    rating,
    content,
    onContentChange,
    onBack,
    onNext,
    isSubmitting,
}: {
    rating: number;
    content: string;
    onContentChange: (content: string) => void;
    onBack: () => void;
    onNext: () => void;
    isSubmitting: boolean;
}) {
    return (
        <div className="flex flex-col py-6 px-6">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium mb-4 self-start"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                Why did you leave this rating?
            </h2>

            {/* Rating display */}
            <div className="text-center mb-4">
                <p className="text-gray-700 font-medium mb-2">{RATING_LABELS[rating]}</p>
                <InteractiveStarRating
                    rating={rating}
                    onRatingChange={() => { }}
                    size="lg"
                    disabled
                />
            </div>

            {/* Review textarea */}
            <div className="mt-6">
                <textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Tell us about your own personal experience taking this course. Was it a good match for you?"
                    className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                    maxLength={2000}
                />
                <p className="text-right text-sm text-gray-400 mt-1">
                    {content.length}/2000
                </p>
            </div>

            {/* Submit button */}
            <div className="flex justify-end mt-6">
                <Button
                    onClick={onNext}
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                    {isSubmitting ? 'Đang gửi...' : 'Save and Continue'}
                </Button>
            </div>
        </div>
    );
}

/**
 * Step3ThankYou - Bước 3: Cảm ơn và xác nhận
 */
function Step3ThankYou({
    rating,
    content,
    userName,
    onBack,
    onClose,
    onShare,
}: {
    rating: number;
    content: string;
    userName: string;
    onBack: () => void;
    onClose: () => void;
    onShare: () => void;
}) {
    // Lấy chữ cái đầu của tên để làm avatar
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex flex-col py-6 px-6">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium mb-4 self-start"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Thanks for helping our community!
            </h2>

            <p className="text-gray-600 text-center mb-6">
                Your review will be public within 24 hours.
            </p>

            <hr className="border-gray-200 my-4" />

            {/* Review preview */}
            <div className="flex items-start gap-4 py-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-white font-semibold">{initials}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <p className="font-medium text-gray-900">{userName}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${star <= rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-yellow-500'
                                    }`}
                                strokeWidth={1.5}
                            />
                        ))}
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">
                        {content || 'There are no written comments for your review.'}
                    </p>
                </div>
            </div>

            <hr className="border-gray-200 my-4" />

            {/* Share button */}
            <div className="flex justify-center my-4">
                <Button
                    variant="outline"
                    onClick={onShare}
                    className="gap-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                    Share
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Save and Exit button */}
            <div className="flex justify-end mt-4">
                <Button
                    onClick={onClose}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                    Save and Exit
                </Button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ReviewModal - Modal cho phép user đánh giá khóa học
 * 
 * TODO: API Integration:
 * 
 * 1. Khi mở modal, check xem user đã có review chưa:
 *    const { data: existingReview } = useQuery({
 *      queryKey: ['my-course-review', courseId],
 *      queryFn: () => reviewApi.getMyReview(courseId),
 *    });
 *    - Nếu có: Pre-fill rating và content, sử dụng PUT để update
 *    - Nếu chưa: Sử dụng POST để create
 * 
 * 2. Submit review:
 *    const createReviewMutation = useMutation({
 *      mutationFn: (data: CreateReviewData) => reviewApi.createReview(courseId, data),
 *      onSuccess: () => {
 *        queryClient.invalidateQueries(['course-reviews', courseId]);
 *        queryClient.invalidateQueries(['course-review-summary', courseId]);
 *      },
 *    });
 */
export function ReviewModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    userName = 'Học viên', // TODO: Replace with useAuth().user.name
}: ReviewModalProps) {
    // Current step: 1 = Select Rating, 2 = Write Review, 3 = Thank You
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [rating, setRating] = useState<number>(0);
    const [content, setContent] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal closes
    const handleClose = () => {
        setStep(1);
        setRating(0);
        setContent('');
        setIsSubmitting(false);
        onClose();
    };

    /**
     * TODO: Implement with API
     * const handleSubmit = async () => {
     *   setIsSubmitting(true);
     *   try {
     *     await createReviewMutation.mutateAsync({ rating, content });
     *     setStep(3); // Move to thank you step
     *   } catch (error) {
     *     toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
     *   } finally {
     *     setIsSubmitting(false);
     *   }
     * };
     */
    const handleSubmit = () => {
        setIsSubmitting(true);

        // Mock API call
        setTimeout(() => {
            console.log('Submit review:', { courseId, rating, content });
            setIsSubmitting(false);
            setStep(3); // Move to thank you step
            toast.success('Đánh giá của bạn đã được gửi!');
        }, 1000);
    };

    const handleShare = () => {
        // TODO: Implement share functionality
        // - Copy link to clipboard
        // - Or open share dialog
        const shareUrl = `${window.location.origin}/courses/${courseId}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Đã sao chép link khóa học!');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Step content */}
                {step === 1 && (
                    <Step1SelectRating
                        rating={rating}
                        onRatingChange={setRating}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <Step2WriteReview
                        rating={rating}
                        content={content}
                        onContentChange={setContent}
                        onBack={() => setStep(1)}
                        onNext={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}

                {step === 3 && (
                    <Step3ThankYou
                        rating={rating}
                        content={content}
                        userName={userName}
                        onBack={() => setStep(2)}
                        onClose={handleClose}
                        onShare={handleShare}
                    />
                )}
            </div>
        </div>
    );
}

export default ReviewModal;
