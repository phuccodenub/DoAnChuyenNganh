import React from 'react';
import { 
  FileText, 
  MessageSquare, 
  Award, 
  Download, 
  Bell, 
  CheckCircle2,
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from './types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

// --- Sub-components ---

const NotificationIcon = ({ type, isRead }: { type: string; isRead: boolean }) => {
  let Icon = Bell;
  let bgColor = 'bg-blue-100';
  let iconColor = 'text-blue-600';

  switch (type) {
    case 'assignment':
      Icon = FileText;
      bgColor = 'bg-orange-100';
      iconColor = 'text-orange-600';
      break;
    case 'achievement':
      Icon = Award;
      bgColor = 'bg-yellow-100';
      iconColor = 'text-yellow-600';
      break;
    case 'certificate':
      Icon = CheckCircle2;
      bgColor = 'bg-green-100';
      iconColor = 'text-green-600';
      break;
    case 'reply':
    case 'discussion':
      Icon = MessageSquare;
      bgColor = 'bg-purple-100';
      iconColor = 'text-purple-600';
      break;
    default:
      Icon = Bell;
  }

  return (
    <div className="relative">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", bgColor)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      {!isRead && (
        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
      )}
    </div>
  );
};

const PointsBadge = ({ points }: { points: number }) => (
  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-xs font-medium text-yellow-700">
    <Award className="w-3.5 h-3.5" />
    <span>+{points} điểm</span>
  </div>
);

const FileAttachmentCard = ({ fileName }: { fileName: string }) => (
  <div className="mt-2 flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
    <div className="p-2 rounded bg-white border border-gray-200">
      <File className="w-4 h-4 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
      <p className="text-xs text-gray-500">PDF Document</p>
    </div>
    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
  </div>
);

const CommentPreview = ({ content, userName }: { content: string; userName?: string }) => (
  <div className="mt-2 pl-3 border-l-2 border-gray-200">
    {userName && <p className="text-xs font-semibold text-gray-700 mb-0.5">{userName}</p>}
    <p className="text-sm text-gray-600 line-clamp-2 italic">"{content}"</p>
  </div>
);

// --- Main Component ---

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const { type, title, description, timestamp, isRead, data } = notification;

  return (
    <div 
      onClick={() => onClick?.(notification)}
      className={cn(
        "flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0",
        !isRead ? "bg-blue-50/30" : ""
      )}
    >
      {/* Left: Icon or Avatar */}
      <div className="flex-shrink-0">
        {(type === 'reply' || type === 'discussion') && data?.userAvatar ? (
          <div className="relative">
            <img 
              src={data.userAvatar} 
              alt={data.userName || 'User'} 
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            {!isRead && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </div>
        ) : (
          <NotificationIcon type={type} isRead={isRead} />
        )}
      </div>

      {/* Right: Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className={cn("text-sm font-semibold text-gray-900", !isRead && "text-blue-700")}>
            {title}
          </h4>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {formatDistanceToNow(timestamp, { addSuffix: true, locale: vi })}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
          {description}
        </p>

        {/* Variants */}
        {type === 'achievement' && data?.points && (
          <PointsBadge points={data.points} />
        )}

        {type === 'certificate' && data?.fileName && (
          <FileAttachmentCard fileName={data.fileName} />
        )}

        {(type === 'reply' || type === 'discussion') && data?.commentContent && (
          <CommentPreview content={data.commentContent} userName={data.userName} />
        )}
      </div>
    </div>
  );
};
