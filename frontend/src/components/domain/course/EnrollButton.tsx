import { PlayCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Course } from '@/services/api/course.api';

interface EnrollButtonProps {
  course: Course;
  isEnrolled: boolean;
  isEnrolling?: boolean;
  onEnroll: () => void;
  onGoToCourse?: () => void;
  className?: string;
}

/**
 * EnrollButton Component
 * 
 * Component button enroll/access course:
 * - Hiển thị "Đăng ký ngay" nếu chưa enroll
 * - Hiển thị "Vào học ngay" nếu đã enroll
 * - Loading state khi đang enroll
 */
export function EnrollButton({
  course,
  isEnrolled,
  isEnrolling = false,
  onEnroll,
  onGoToCourse,
  className = '',
}: EnrollButtonProps) {
  const handleClick = () => {
    if (isEnrolled) {
      onGoToCourse?.();
    } else {
      onEnroll();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isEnrolling}
      fullWidth
      size="lg"
      className={className}
      isLoading={isEnrolling && !isEnrolled}
    >
      {isEnrolled ? (
        <>
          <PlayCircle className="w-5 h-5 mr-2" />
          Vào học ngay
        </>
      ) : (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          {course.is_free ? 'Đăng ký miễn phí' : 'Đăng ký ngay'}
        </>
      )}
    </Button>
  );
}

