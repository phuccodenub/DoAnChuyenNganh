import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Course } from '@/services/api/course.api';

interface CourseTableViewProps {
  courses: Course[];
}

type SortField = 'title' | 'created_at' | 'difficulty' | 'enrollments';
type SortOrder = 'asc' | 'desc';

const difficultyLabels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

const difficultyColors: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

/**
 * CourseTableView Component
 * 
 * Hiển thị khóa học dạng bảng với:
 * - Sorting theo tên, ngày tạo, độ khó, số học viên
 * - Grouping theo category (có thể thu gọn/mở rộng)
 * - Hiển thị đầy đủ thông tin: title, instructor, description, difficulty, tags, status
 */
export function CourseTableView({ courses }: CourseTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Sort courses
  const sortedCourses = [...courses].sort((a, b) => {
    let compareValue = 0;

    switch (sortField) {
      case 'title':
        compareValue = a.title.localeCompare(b.title);
        break;
      case 'created_at':
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        compareValue = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
      case 'enrollments':
        compareValue = (a._count?.enrollments || 0) - (b._count?.enrollments || 0);
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Group by category
  const groupedCourses = sortedCourses.reduce((acc, course) => {
    const categoryName = course.category?.name || 'Chưa phân loại';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {children}
      <ArrowUpDown
        className={`w-4 h-4 ${
          sortField === field ? 'text-blue-600' : 'text-gray-400'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="title">Khóa học</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảng viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="difficulty">Độ khó</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="enrollments">Học viên</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="created_at">Ngày tạo</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedCourses).map(([categoryName, categoryCourses]) => {
              const isCollapsed = collapsedGroups.has(categoryName);
              
              return (
                <Fragment key={categoryName}>
                  {/* Category header */}
                  <tr className="bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <td
                      colSpan={6}
                      onClick={() => toggleGroup(categoryName)}
                      className="px-6 py-3"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-900">
                          {categoryName}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({categoryCourses.length} khóa học)
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Category courses */}
                  {!isCollapsed &&
                    categoryCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/courses/${course.id}`}
                            className="block group"
                          >
                            <div className="font-medium text-gray-900 group-hover:text-blue-600">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {course.description}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {course.instructor?.full_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={difficultyColors[course.difficulty]}>
                            {difficultyLabels[course.difficulty]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {course._count?.enrollments || 0} học viên
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {new Date(course.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {course.is_free ? (
                            <Badge variant="success">Miễn phí</Badge>
                          ) : (
                            <Badge variant="default">
                              {course.price?.toLocaleString('vi-VN')}đ
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CourseTableView;
