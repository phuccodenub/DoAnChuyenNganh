/**
 * useChatPermissions Hook
 * 
 * Hook để kiểm tra quyền hạn chat dựa trên role của user
 * 
 * Ma trận quyền:
 * | Action                     | Student | Instructor | Admin |
 * |----------------------------|---------|------------|-------|
 * | Xem danh sách conversations| ✅      | ✅         | ✅    |
 * | Gửi tin nhắn               | ✅      | ✅         | ✅    |
 * | Bắt đầu DM với Instructor  | ✅      | ✅         | ✅    |
 * | Bắt đầu DM với Student     | ❌      | ✅         | ✅    |
 * | Bắt đầu DM với Admin       | ❌      | ❌         | ✅    |
 * | Tạo Group Chat             | ❌      | ✅         | ✅    |
 * | Thêm/xóa member trong Group| ❌      | ✅ (owner) | ✅    |
 * | Tham gia Course Discussion | ✅ (enrolled) | ✅ (owner) | ✅ |
 * | Gửi Announcement           | ❌      | ✅         | ✅    |
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'student' | 'instructor' | 'admin' | 'super_admin';

export interface ChatPermissions {
  // Conversation permissions
  canViewConversations: boolean;
  canSendMessages: boolean;
  
  // DM permissions
  canStartDMWithInstructor: boolean;
  canStartDMWithStudent: boolean;
  canStartDMWithAdmin: boolean;
  canStartDMWithAnyUser: boolean;
  
  // Group chat permissions
  canCreateGroup: boolean;
  canManageGroupMembers: boolean;
  
  // Course discussion permissions
  canJoinCourseDiscussion: boolean;
  canSendAnnouncement: boolean;
  
  // Message actions
  canEditOwnMessages: boolean;
  canDeleteOwnMessages: boolean;
  canDeleteAnyMessage: boolean;
  canPinMessages: boolean;
  
  // Moderation
  canMuteUsers: boolean;
  canBanUsers: boolean;
  
  // Helper methods
  canStartDMWith: (targetRole: UserRole) => boolean;
}

export function useChatPermissions(): ChatPermissions {
  const { user } = useAuth();
  const role = (user?.role || 'student') as UserRole;

  const permissions = useMemo<ChatPermissions>(() => {
    const isStudent = role === 'student';
    const isInstructor = role === 'instructor';
    const isAdmin = role === 'admin' || role === 'super_admin';

    return {
      // Basic permissions - everyone has these
      canViewConversations: true,
      canSendMessages: true,
      canEditOwnMessages: true,
      canDeleteOwnMessages: true,

      // DM permissions
      canStartDMWithInstructor: true, // Everyone can message instructors
      canStartDMWithStudent: isInstructor || isAdmin,
      canStartDMWithAdmin: isAdmin, // Only admins can DM other admins
      canStartDMWithAnyUser: isAdmin, // Admin can chat with anyone

      // Group chat permissions
      canCreateGroup: isInstructor || isAdmin,
      canManageGroupMembers: isInstructor || isAdmin, // Note: Owner check happens at API level

      // Course discussion permissions
      canJoinCourseDiscussion: true, // Enrollment check happens at API level
      canSendAnnouncement: isInstructor || isAdmin,

      // Admin-only permissions
      canDeleteAnyMessage: isAdmin,
      canPinMessages: isInstructor || isAdmin,
      canMuteUsers: isInstructor || isAdmin,
      canBanUsers: isAdmin,

      // Helper method to check if user can start DM with specific role
      canStartDMWith: (targetRole: UserRole): boolean => {
        if (isAdmin) return true; // Admin can DM anyone
        if (targetRole === 'instructor') return true; // Everyone can DM instructors
        if (targetRole === 'student' && (isInstructor || isAdmin)) return true;
        if (targetRole === 'admin' && isAdmin) return true;
        return false;
      },
    };
  }, [role]);

  return permissions;
}

/**
 * Hook to check if current user can interact with a specific user
 */
export function useCanChatWith(targetUserId: string, targetRole?: UserRole): boolean {
  const { user } = useAuth();
  const permissions = useChatPermissions();

  return useMemo(() => {
    // Can't chat with self
    if (user?.id === targetUserId) return false;

    // If target role is known, use permission matrix
    if (targetRole) {
      return permissions.canStartDMWith(targetRole);
    }

    // If target role is unknown, allow (API will handle validation)
    return true;
  }, [user?.id, targetUserId, targetRole, permissions]);
}

/**
 * Hook to get list of roles the current user can start DM with
 */
export function useAllowedChatTargets(): UserRole[] {
  const permissions = useChatPermissions();

  return useMemo(() => {
    const targets: UserRole[] = [];

    if (permissions.canStartDMWithInstructor) targets.push('instructor');
    if (permissions.canStartDMWithStudent) targets.push('student');
    if (permissions.canStartDMWithAdmin) {
      targets.push('admin');
      targets.push('super_admin');
    }

    return targets;
  }, [permissions]);
}

export default useChatPermissions;
