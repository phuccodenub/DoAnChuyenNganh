import {
    BookOpen,
    Eye,
    Upload,
    Save,
    AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CourseDetail, statusLabels } from './types';

interface SettingsTabProps {
    course: CourseDetail;
    onSave: () => void;
}

/**
 * SettingsTab Component
 * 
 * Quản lý cài đặt khóa học:
 * - Thông tin cơ bản (tiêu đề, mô tả)
 * - Thumbnail
 * - Định giá
 * - Trạng thái xuất bản
 * 
 * TODO: API call - PUT /api/instructor/courses/:courseId
 * TODO: API call - POST /api/instructor/courses/:courseId/thumbnail
 * TODO: API call - PUT /api/instructor/courses/:courseId/status
 */
export function SettingsTab({ course, onSave }: SettingsTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Cài đặt khóa học</h2>
                <p className="text-sm text-gray-500">Chỉnh sửa thông tin và cấu hình khóa học</p>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* TODO: API call - PUT /api/instructor/courses/:courseId */}
                    <Input
                        label="Tiêu đề khóa học"
                        defaultValue={course.title}
                        placeholder="Nhập tiêu đề khóa học"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả khóa học
                        </label>
                        <textarea
                            defaultValue={course.description}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card>
                <CardHeader>
                    <CardTitle>Ảnh thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* TODO: API call - POST /api/instructor/courses/:courseId/thumbnail */}
                    <div className="flex items-start gap-6">
                        {course.thumbnail_url ? (
                            <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-48 h-28 object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-10 h-10 text-gray-300" />
                            </div>
                        )}
                        <div>
                            <Button variant="outline" className="gap-2">
                                <Upload className="w-4 h-4" />
                                Thay đổi ảnh
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG tối đa 2MB. Tỷ lệ 16:9</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
                <CardHeader>
                    <CardTitle>Định giá</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* TODO: API call - PUT /api/instructor/courses/:courseId */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="pricing"
                                defaultChecked={course.is_free}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Miễn phí</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="pricing"
                                defaultChecked={!course.is_free}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Có phí</span>
                        </label>
                    </div>
                    {!course.is_free && (
                        <Input
                            type="number"
                            label="Giá khóa học (VNĐ)"
                            defaultValue={course.price}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Trạng thái xuất bản</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* TODO: API call - PUT /api/instructor/courses/:courseId/status */}
                    <div className="flex items-center gap-4">
                        <Badge variant={statusLabels[course.status].variant}>
                            {statusLabels[course.status].label}
                        </Badge>
                        {course.status === 'draft' && (
                            <Button size="sm" className="gap-2">
                                <Eye className="w-4 h-4" />
                                Xuất bản khóa học
                            </Button>
                        )}
                        {course.status === 'published' && (
                            <Button size="sm" variant="outline" className="gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Chuyển sang bản nháp
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button className="gap-2" onClick={onSave}>
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                </Button>
            </div>
        </div>
    );
}

export default SettingsTab;
