import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle } from 'lucide-react';
import { assignmentApi } from '@/services/api/assignment.api';
import { AssignmentsListTab, SubmissionsTab as SubmissionsTabComponent } from '@/pages/instructor/components/courseDetail';
import type { Assignment, Submission, AssignmentStats } from '@/pages/instructor/components/courseDetail/types';
import { useCourseAssignments } from '@/hooks/useAssignments';
import { useCourseStudents } from '@/hooks/useInstructorCourse';

interface SubmissionsTabProps {
  courseId: string;
}

export function SubmissionsTab({ courseId }: SubmissionsTabProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Fetch assignments
  const { data: assignmentsData, isLoading: assignmentsLoading } = useCourseAssignments(courseId);
  
  // Fetch students for stats
  const { data: studentsResponse } = useCourseStudents(courseId);

  // Transform assignments data
  const assignments: Assignment[] = useMemo(() => {
    if (!assignmentsData) return [];
    return assignmentsData.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: 'assignment' as const,
      due_date: a.due_date || '',
      max_score: a.max_score || 100,
      is_active: a.is_published || false,
      created_at: a.created_at || '',
      lesson_id: a.lesson_id,
      lesson_title: a.lesson?.title,
      section_title: a.section?.title,
    }));
  }, [assignmentsData]);

  // Fetch submissions for selected assignment
  const { data: submissionsResponse, isLoading: submissionsLoading } = useQuery({
    queryKey: ['assignment-submissions', selectedAssignment?.id],
    queryFn: async () => {
      if (!selectedAssignment) return null;
      return await assignmentApi.getAssignmentSubmissions(selectedAssignment.id, 1, 100);
    },
    enabled: !!selectedAssignment,
  });

  // Fetch assignment stats
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['assignment-stats', selectedAssignment?.id],
    queryFn: async () => {
      if (!selectedAssignment) return null;
      return await assignmentApi.getAssignmentStats(selectedAssignment.id);
    },
    enabled: !!selectedAssignment,
  });

  // Transform submissions data
  const submissions: Submission[] = useMemo(() => {
    if (!submissionsResponse?.rows) return [];
    return submissionsResponse.rows.map((s: any) => {
      // Parse file_url - could be JSON array string or single URL
      let fileUrls: string[] = [];
      if (s.file_url) {
        try {
          // Try to parse as JSON array
          const parsed = JSON.parse(s.file_url);
          fileUrls = Array.isArray(parsed) ? parsed : [s.file_url];
        } catch {
          // If not JSON, treat as single URL
          fileUrls = [s.file_url];
        }
      } else if (s.file_urls) {
        fileUrls = Array.isArray(s.file_urls) ? s.file_urls : [];
      }

      // Filter out null, undefined, empty strings, or invalid URLs
      fileUrls = fileUrls.filter((url: any) => 
        url && url !== 'null' && url !== 'undefined' && typeof url === 'string' && url.trim() !== ''
      );

      return {
        id: s.id,
        student_id: s.user_id || s.student?.id || '',
        student_name: s.student ? `${s.student.first_name || ''} ${s.student.last_name || ''}`.trim() : 'Unknown',
        student_avatar: s.student?.avatar_url,
        student_mssv: s.student?.student_id,
        assignment_title: selectedAssignment?.title || '',
        assignment_type: 'assignment' as const,
        submitted_at: s.submitted_at || '',
        is_late: s.is_late || false,
        late_duration: s.late_duration,
        status: s.status === 'graded' ? 'graded' : s.status === 'submitted' ? 'pending' : 'missing',
        score: s.score,
        max_score: selectedAssignment?.max_score || 100,
        submission_text: s.submission_text,
        file_urls: fileUrls,
        feedback: s.feedback,
        graded_at: s.graded_at,
      };
    });
  }, [submissionsResponse, selectedAssignment]);

  // Calculate assignment stats
  const assignmentStats: AssignmentStats = useMemo(() => {
    const totalStudents = (studentsResponse?.data as any)?.students?.length || (studentsResponse?.data as any)?.length || 0;
    const submittedCount = submissions.filter(s => s.status !== 'missing').length;
    const pendingCount = submissions.filter(s => s.status === 'pending').length;
    const gradedSubmissions = submissions.filter(s => s.status === 'graded');
    const avgScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : 0;

    return {
      total_students: totalStudents,
      submitted_count: submittedCount,
      pending_grading_count: pendingCount,
      average_score: avgScore,
      due_date: selectedAssignment?.due_date || '',
      is_overdue: selectedAssignment?.due_date ? new Date(selectedAssignment.due_date) < new Date() : false,
    };
  }, [submissions, studentsResponse, selectedAssignment]);

  if (assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!selectedAssignment) {
    return (
      <div className="mt-6">
        <AssignmentsListTab
          assignments={assignments}
          onSelectAssignment={setSelectedAssignment}
        />
      </div>
    );
  }

  if (submissionsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <SubmissionsTabComponent
        submissions={submissions}
        assignmentStats={assignmentStats}
        assignmentTitle={selectedAssignment.title}
        courseTitle=""
        courseId={courseId}
        assignmentId={selectedAssignment.id}
        onBack={() => setSelectedAssignment(null)}
      />
    </div>
  );
}
