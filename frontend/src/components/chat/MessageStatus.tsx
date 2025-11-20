import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

export interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read' | 'pending';
  className?: string;
  showLabel?: boolean;
}

/**
 * Component to display message delivery status
 * Shows visual indicator for sent, delivered, or read status
 */
export const MessageStatus: React.FC<MessageStatusProps> = ({
  status = 'pending',
  className = '',
  showLabel = false
}) => {
  const getIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock size={14} className="text-gray-400" />;
      case 'sent':
        return <Check size={14} className="text-gray-500" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-blue-500" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-600" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'pending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} title={getLabel()}>
      {getIcon()}
      {showLabel && <span className="text-xs text-gray-600">{getLabel()}</span>}
    </div>
  );
};

export default MessageStatus;
