/**
 * Chat Feature Hooks
 * 
 * Re-export all chat-related hooks
 */

export { useDMSocket, useCourseChatSocket, useChatNotifications } from './useChatSocket';
export { 
  useChatPermissions, 
  useCanChatWith, 
  useAllowedChatTargets,
  type ChatPermissions,
} from './useChatPermissions';
