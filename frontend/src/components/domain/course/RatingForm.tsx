import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';

interface RatingFormProps {
  courseId: string;
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function RatingForm({
  courseId,
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  isEditing = false,
}: RatingFormProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating, comment);
      toast.success(isEditing ? 'Đã cập nhật đánh giá' : 'Đã gửi đánh giá');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredStar || selectedRating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đánh giá của bạn
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {selectedRating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {selectedRating} sao
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nhận xét (tùy chọn)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || selectedRating === 0}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <span>{isEditing ? 'Cập nhật' : 'Gửi đánh giá'}</span>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        )}
      </div>
    </form>
  );
}

