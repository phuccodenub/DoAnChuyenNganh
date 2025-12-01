import { Button } from '@/components/ui/Button';

interface FormFooterProps {
    onCancel: () => void;
    onSaveDraft: () => void;
    onContinue: () => void;
    isLoading?: boolean;
}

export function FormFooter({ onCancel, onSaveDraft, onContinue, isLoading }: FormFooterProps) {
    return (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={onSaveDraft} disabled={isLoading}>
                        Save as Draft
                    </Button>
                    <Button onClick={onContinue} disabled={isLoading}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}