/**
 * Lesson Components - Exports
 * Centralized exports for lesson-related components
 */

export { CurriculumSidebar } from './CurriculumSidebar';
export { CurriculumTree } from './CurriculumTree';
export { DiscussionTab } from './DiscussionTab';
export { DocumentViewer } from './DocumentViewer';
export { FileTab } from './FileTab';
export { VideoPlayer } from './VideoPlayer';
export { LessonPlayer } from './LessonPlayer';

// Re-export types
export type { Section, Lesson } from '@/services/api/lesson.api';
