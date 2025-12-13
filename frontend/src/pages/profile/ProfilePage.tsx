import { useAuth } from '@/hooks/useAuth';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { InstructorDashboardLayout } from '@/layouts/InstructorDashboardLayout';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import ProfilePageContent from './ProfileContent';

/**
 * Shared ProfilePage wrapper
 * Automatically selects appropriate dashboard layout based on user role
 */
export default function ProfilePage() {
  const { user } = useAuth();

  // Determine which layout to use based on user role
  const renderWithLayout = (content: React.ReactNode) => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return (
          <AdminDashboardLayout>
            {content}
          </AdminDashboardLayout>
        );
      
      case 'instructor':
        return (
          <InstructorDashboardLayout>
            {content}
          </InstructorDashboardLayout>
        );
      
      case 'student':
      default:
        return (
          <StudentDashboardLayout>
            {content}
          </StudentDashboardLayout>
        );
    }
  };

  return renderWithLayout(<ProfilePageContent />);
}
