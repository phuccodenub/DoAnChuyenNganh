/**
 * Study Plan Page - Student
 * 
 * Displays personalized study plan based on AI analysis
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StudyPlanDashboard } from '@/components/student/StudyPlanDashboard';
import { generateRoute } from '@/constants/routes';

export function StudyPlanPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  if (!courseId) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">Không tìm thấy khóa học</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(generateRoute.student.learning(courseId))}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Về khóa học
        </Button>
      </div>

      {/* Main Content */}
      <StudyPlanDashboard courseId={courseId} />
    </div>
  );
}

export default StudyPlanPage;
