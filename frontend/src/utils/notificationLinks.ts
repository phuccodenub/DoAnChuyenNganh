import type { Notification as ComponentNotification } from '@/components/notifications/types';
import type { Notification as ApiNotification } from '@/services/api/notifications.api';

type NotificationLinkSource = ComponentNotification | ApiNotification;

type NotificationMeta = Record<string, unknown> | undefined;

type NotificationData = {
  courseId?: string;
  [key: string]: unknown;
} | undefined;

const extractId = (match: RegExpMatchArray | null): string | null => {
  if (!match || !match[1]) return null;
  return match[1];
};

const getRawLink = (notification: NotificationLinkSource): string | null => {
  if ('linkUrl' in notification && typeof notification.linkUrl === 'string') {
    return notification.linkUrl.trim();
  }
  if ('link_url' in notification && typeof notification.link_url === 'string') {
    return notification.link_url.trim();
  }
  return null;
};

const getCourseId = (notification: NotificationLinkSource): string | null => {
  const data = (notification as ComponentNotification).data as NotificationData;
  if (data?.courseId) return data.courseId;

  const metadata = (notification as ApiNotification).metadata as NotificationMeta;
  const courseId = metadata?.courseId || metadata?.course_id;
  if (typeof courseId === 'string') return courseId;

  return null;
};

export const resolveNotificationLink = (notification: NotificationLinkSource): string | null => {
  const rawLink = getRawLink(notification);
  if (!rawLink) return null;

  // Prefer new course-scoped student routes if already provided
  if (rawLink.startsWith('/student/courses/')) {
    return rawLink;
  }

  const courseId = getCourseId(notification);

  // Normalize old assignment route -> new course-scoped route when possible
  const assignmentId = extractId(rawLink.match(/^\/student\/assignments\/([^/?#]+)/));
  if (assignmentId) {
    if (courseId) {
      return `/student/courses/${courseId}/assignments/${assignmentId}`;
    }
    return rawLink;
  }

  // Normalize old quiz route -> new course-scoped route when possible
  const quizId = extractId(rawLink.match(/^\/student\/quizzes\/([^/?#]+)/));
  if (quizId) {
    if (courseId) {
      return `/student/courses/${courseId}/quizzes/${quizId}`;
    }
    return rawLink;
  }

  // Normalize old lesson route -> new course-scoped route when possible
  const lessonId = extractId(rawLink.match(/^\/student\/lessons\/([^/?#]+)/));
  if (lessonId) {
    if (courseId) {
      return `/student/courses/${courseId}/lessons/${lessonId}`;
    }
    return rawLink;
  }

  // Normalize legacy certificate route
  const certificateId = extractId(rawLink.match(/^\/student\/certificates\/([^/?#]+)/));
  if (certificateId) {
    return `/certificates/${certificateId}`;
  }

  // Normalize legacy messages routes
  if (rawLink === '/student/chat') {
    return '/messages';
  }

  return rawLink;
};
