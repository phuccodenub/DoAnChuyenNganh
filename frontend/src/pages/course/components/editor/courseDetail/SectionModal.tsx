import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from './types';

interface SectionModalProps {
    isOpen: boolean;
    editingSection: Section | null;
    sectionTitle: string;
    onTitleChange: (title: string) => void;
    onSave: () => void;
    onClose: () => void;
}

/**
 * SectionModal Component
 * 
 * Modal để thêm/sửa chương (Section)
 * 
 * TODO: API call - POST /api/instructor/courses/:courseId/sections (create)
 * TODO: API call - PUT /api/instructor/courses/:courseId/sections/:sectionId (update)
 */
export function SectionModal({
    isOpen,
    editingSection,
    sectionTitle,
    onTitleChange,
    onSave,
    onClose,
}: SectionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-4">
                    {editingSection ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
                </h3>
                <div className="space-y-4">
                    <Input
                        label="Tiêu đề chương"
                        value={sectionTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="VD: Giới thiệu về React"
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button onClick={onSave} disabled={!sectionTitle.trim()}>
                            {editingSection ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SectionModal;
