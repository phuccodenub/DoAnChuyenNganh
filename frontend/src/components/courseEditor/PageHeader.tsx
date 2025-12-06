import { ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
    title: string;
    breadcrumbs: string[];
    onCreateNew?: () => void;
}

export function PageHeader({ title, breadcrumbs, onCreateNew }: PageHeaderProps) {
    return (
        <div className="mb-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center">
                        {index > 0 && <ChevronRight className="w-4 h-4 mx-1.5" />}
                        <span className={index === breadcrumbs.length - 1 ? 'text-gray-700 font-medium' : 'hover:text-gray-700'}>
                            {crumb}
                        </span>
                    </span>
                ))}
            </nav>
            
            {/* Title and Action */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500 mt-1.5 text-sm">
                        {breadcrumbs[breadcrumbs.length - 1] === 'Tạo mới' 
                            ? 'Tạo khóa học mới và bắt đầu xây dựng nội dung'
                            : 'Chỉnh sửa thông tin khóa học của bạn'}
                    </p>
                </div>
                {onCreateNew && (
                    <Button onClick={onCreateNew} className="gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />
                        Tạo khóa học mới
                    </Button>
                )}
            </div>
        </div>
    );
}