/**
 * Repository exports
 * Provides a centralized way to import repository classes
 */

// ===== BASE REPOSITORY =====
export { BaseRepository } from './base.repository';

// ===== SPECIFIC REPOSITORIES =====
export { UserRepository } from './user.repository';
export { CourseRepository } from '../modules/course/course.repository';
export { EnrollmentRepository } from './enrollment.repository';

// ===== REPOSITORY INSTANCES =====
import { UserRepository } from './user.repository';
import { CourseRepository } from '../modules/course/course.repository';
import { EnrollmentRepository } from './enrollment.repository';

/**
 * Repository instances
 * Pre-instantiated objects for easy use
 */
export const repositories = {
  user: new UserRepository(),
  course: new CourseRepository(),
  enrollment: new EnrollmentRepository()
};

/**
 * Repository factory
 * Creates new instances of repository classes
 */
export const createRepositories = () => ({
  user: new UserRepository(),
  course: new CourseRepository(),
  enrollment: new EnrollmentRepository()
});

// ===== DEFAULT EXPORT =====
export default repositories;
