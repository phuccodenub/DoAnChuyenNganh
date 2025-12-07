import { Button } from '@/components/ui/Button';

interface FormFooterProps {
    onCancel: () => void;
    onSaveDraft: () => void;
    onContinue: () => void;
    isLoading?: boolean;
}

export function FormFooter({ onCancel, onSaveDraft, onContinue, isLoading }: FormFooterProps) {
    return (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg z-20">
            <div className="max-w-8xl mx-auto flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    onClick={onCancel} 
                    disabled={isLoading}
                    className="text-gray-700 hover:text-gray-900"
                >
                    Hủy
                </Button>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={onSaveDraft} 
                        disabled={isLoading}
                        className="min-w-[140px]"
                    >
                        Lưu nháp
                    </Button>
                    <Button 
                        onClick={onContinue} 
                        disabled={isLoading}
                        className="min-w-[140px] shadow-sm"
                    >
                        Tiếp tục
                    </Button>
                </div>
            </div>
        </div>
    );
}