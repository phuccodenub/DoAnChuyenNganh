/**
 * ChatTabs Component
 * 
 * Tab navigation for switching between different chat types:
 * - Direct Messages (DM): Private conversations between users
 * - Course Discussions: Group discussions within courses
 * - Group Chats (Future): Group conversations
 */

import { useState, useCallback } from 'react';
import { MessageCircle, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChatTabType = 'dm' | 'courses' | 'groups';

interface ChatTab {
  id: ChatTabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  disabled?: boolean;
}

interface ChatTabsProps {
  activeTab: ChatTabType;
  onTabChange: (tab: ChatTabType) => void;
  dmUnreadCount?: number;
  courseUnreadCount?: number;
  groupUnreadCount?: number;
  showGroupsTab?: boolean;
  className?: string;
}

export function ChatTabs({
  activeTab,
  onTabChange,
  dmUnreadCount = 0,
  courseUnreadCount = 0,
  groupUnreadCount = 0,
  showGroupsTab = false,
  className,
}: ChatTabsProps) {
  const tabs: ChatTab[] = [
    {
      id: 'dm',
      label: 'Tin nhắn riêng',
      icon: MessageCircle,
      badge: dmUnreadCount,
    },
    {
      id: 'courses',
      label: 'Thảo luận khóa học',
      icon: BookOpen,
      badge: courseUnreadCount,
    },
    ...(showGroupsTab
      ? [
          {
            id: 'groups' as ChatTabType,
            label: 'Nhóm chat',
            icon: Users,
            badge: groupUnreadCount,
            disabled: true, // Future feature
          },
        ]
      : []),
  ];

  const handleTabClick = useCallback(
    (tab: ChatTab) => {
      if (!tab.disabled) {
        onTabChange(tab.id);
      }
    },
    [onTabChange]
  );

  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      <nav className="flex -mb-px" aria-label="Chat tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasUnread = tab.badge && tab.badge > 0;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              disabled={tab.disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                'border-b-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={tab.disabled}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {hasUnread && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full',
                    isActive
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {tab.badge! > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Hook for managing chat tabs state
 */
export function useChatTabs(initialTab: ChatTabType = 'dm') {
  const [activeTab, setActiveTab] = useState<ChatTabType>(initialTab);

  const handleTabChange = useCallback((tab: ChatTabType) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    setActiveTab: handleTabChange,
  };
}

export default ChatTabs;
