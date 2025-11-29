import { ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
    title: string;
    breadcrumbs: string[];
    onCreateNew?: () => void;
}

export function PageHeader({ title, breadcrumbs, onCreateNew }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <nav className="flex items-center gap-1 text-sm text-gray-500">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                            <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                                {crumb}
                            </span>
                        </span>
                    ))}
                </nav>
            </div>
            {onCreateNew && (
                <Button onClick={onCreateNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New
                </Button>
            )}
        </div>
    );
}