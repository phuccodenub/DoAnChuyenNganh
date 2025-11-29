import { Card, CardContent } from '@/components/ui/Card';
import { Student } from './types';

interface StudentsTabProps {
    students: Student[];
}

/**
 * StudentsTab Component
 * 
 * Hiển thị danh sách học viên:
 * - Thông tin học viên
 * - Tiến độ học
 * - Hoạt động gần nhất
 * 
 * TODO: API call - GET /api/instructor/courses/:courseId/students
 * TODO: Thêm search/filter
 * TODO: Thêm pagination
 */
export function StudentsTab({ students }: StudentsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách học viên</h2>
                    <p className="text-sm text-gray-500">{students.length} học viên đã đăng ký</p>
                </div>
                {/* TODO: Add search/filter */}
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Học viên
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Ngày đăng ký
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tiến độ
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Hoạt động gần nhất
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                                <p className="text-xs text-gray-500">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(student.enrolled_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                <div
                                                    className={`h-2 rounded-full ${student.progress_percent === 100
                                                            ? 'bg-green-500'
                                                            : student.progress_percent >= 50
                                                                ? 'bg-blue-500'
                                                                : 'bg-orange-500'
                                                        }`}
                                                    style={{ width: `${student.progress_percent}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600">{student.progress_percent}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(student.last_activity_at).toLocaleDateString('vi-VN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

export default StudentsTab;
