import { ReactNode } from 'react';

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
    maxWidth?: string;
}

export function PageWrapper({
    children,
    className = '',
    maxWidth = 'max-w-8xl'
}: PageWrapperProps) {
    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            <div className={`${maxWidth} mx-auto py-8 px-4`}>
                {children}
            </div>
        </div>
    );
}