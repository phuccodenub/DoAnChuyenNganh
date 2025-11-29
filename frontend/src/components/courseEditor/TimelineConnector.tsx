import { ReactNode } from 'react';

interface TimelineConnectorProps {
    children: ReactNode;
    isLast?: boolean;
}

export function TimelineConnector({ children, isLast = false }: TimelineConnectorProps) {
    return (
        <div className="relative">
            {/* Vertical line */}
            {!isLast && (
                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Dot indicator */}
            <div className="absolute left-2 top-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-white shadow-sm" />

            {/* Content */}
            <div className="ml-8">
                {children}
            </div>
        </div>
    );
}