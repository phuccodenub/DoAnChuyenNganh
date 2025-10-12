/**
 * Course module exports
 * Provides a centralized way to import course-related functionality
 */

// ===== CONTROLLERS =====
export { CourseController } from './course.controller';

// ===== SERVICES =====
export { CourseService } from './course.service';

// ===== REPOSITORIES =====
export { CourseRepository } from './course.repository';

// ===== TYPES =====
export * from './course.types';

// ===== ROUTES =====
export { courseRoutes } from './course.routes';

// ===== VALIDATION =====
export { courseValidation } from './course.validate';

// ===== MODULE INSTANCES =====
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { courseRoutes } from './course.routes';

/**
 * Course module instances
 * Pre-instantiated objects for easy use
 */
export const courseModule = {
  controller: new CourseController(),
  service: new CourseService(),
  repository: new CourseRepository(),
  routes: courseRoutes
};

/**
 * Course module factory
 * Creates new instances of course module components
 */
export const createCourseModule = () => ({
  controller: new CourseController(),
  service: new CourseService(),
  repository: new CourseRepository(),
  routes: courseRoutes
});

// ===== DEFAULT EXPORT =====
export default courseModule;
