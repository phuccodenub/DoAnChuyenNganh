import { useState, useEffect, useRef } from 'react';
import {
    BookOpen,
    Eye,
    Upload,
    Save,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CourseDetail, statusLabels } from './types';
import { mediaApi } from '@/services/api/media.api';
import toast from 'react-hot-toast';

interface SettingsTabProps {
    course: CourseDetail;
    onSave: (data: {
        title: string;
        description: string;
        is_free: boolean;
        price?: number;
        thumbnail_url?: string;
    }) => Promise<void>;
    onPublish?: () => Promise<void>;
    onUnpublish?: () => Promise<void>;
    isSaving?: boolean;
}

/**
 * SettingsTab Component
 * 
 * Quản lý cài đặt khóa học:
 * - Thông tin cơ bản (tiêu đề, mô tả)
 * - Thumbnail
 * - Định giá
 * - Trạng thái xuất bản
 */
export function SettingsTab({ course, onSave, onPublish, onUnpublish, isSaving }: SettingsTabProps) {
    // Form state
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description || '');
    const [isFree, setIsFree] = useState(course.is_free);
    const [price, setPrice] = useState(course.price || 0);
    const [thumbnailPreview, setThumbnailPreview] = useState(course.thumbnail_url || '');
    const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || ''); // Actual URL to save
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when course changes
    useEffect(() => {
        setTitle(course.title);
        setDescription(course.description || '');
        setIsFree(course.is_free);
        setPrice(course.price || 0);
        setThumbnailPreview(course.thumbnail_url || '');
        setThumbnailUrl(course.thumbnail_url || '');
    }, [course]);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề khóa học');
            return;
        }
        
        try {
            await onSave({
                title: title.trim(),
                description: description.trim(),
                is_free: isFree,
                price: isFree ? 0 : price,
                thumbnail_url: thumbnailUrl || undefined,
            });
            toast.success('Đã lưu thay đổi');
        } catch (error) {
            toast.error('Không thể lưu thay đổi');
        }
    };

    const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ảnh không được vượt quá 5MB');
                return;
            }

            // Show local preview immediately
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
            
            // Upload file to Cloudinary
            setIsUploading(true);
            try {
                const result = await mediaApi.uploadCourseCover(file, course.id);
                if (result.success && result.data?.url) {
                    setThumbnailUrl(result.data.url);
                    setThumbnailPreview(result.data.url); // Replace blob URL with real URL
                    URL.revokeObjectURL(previewUrl); // Cleanup blob URL
                    toast.success('Đã tải lên ảnh thumbnail mới');
                } else {
                    toast.error(result.message || 'Không thể tải lên ảnh');
                    setThumbnailPreview(course.thumbnail_url || ''); // Revert to original
                }
            } catch (error) {
                console.error('Thumbnail upload error:', error);
                toast.error('Không thể tải lên ảnh. Vui lòng thử lại.');
                setThumbnailPreview(course.thumbnail_url || ''); // Revert to original
            } finally {
                setIsUploading(false);
            }
        }
    };

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
                    <Input
                        label="Tiêu đề khóa học"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề khóa học"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả khóa học
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            {thumbnailPreview ? (
                                <img
                                    src={thumbnailPreview}
                                    alt={title}
                                    className={`w-48 h-28 object-cover rounded-lg ${isUploading ? 'opacity-50' : ''}`}
                                />
                            ) : (
                                <div className="w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-10 h-10 text-gray-300" />
                                </div>
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleThumbnailChange}
                                accept="image/png,image/jpeg,image/jpg"
                                className="hidden"
                                disabled={isUploading}
                            />
                            <Button 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang tải lên...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Thay đổi ảnh
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG tối đa 5MB. Tỷ lệ 16:9</p>
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
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="pricing"
                                checked={isFree}
                                onChange={() => setIsFree(true)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Miễn phí</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="pricing"
                                checked={!isFree}
                                onChange={() => setIsFree(false)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Có phí</span>
                        </label>
                    </div>
                    {!isFree && (
                        <Input
                            type="number"
                            label="Giá khóa học (VNĐ)"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
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
                    <div className="flex items-center gap-4">
                        <Badge variant={statusLabels[course.status].variant}>
                            {statusLabels[course.status].label}
                        </Badge>
                        {course.status === 'draft' && onPublish && (
                            <Button size="sm" className="gap-2" onClick={onPublish}>
                                <Eye className="w-4 h-4" />
                                Xuất bản khóa học
                            </Button>
                        )}
                        {course.status === 'published' && onUnpublish && (
                            <Button size="sm" variant="outline" className="gap-2" onClick={onUnpublish}>
                                <AlertCircle className="w-4 h-4" />
                                Chuyển sang bản nháp
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </div>
        </div>
    );
}

export default SettingsTab;
