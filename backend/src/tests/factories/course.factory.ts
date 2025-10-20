/**
 * Course Factory
 * Factory for creating test courses
 */

import { TestCourse, generateTestCourse } from '../utils/test.utils';

export class CourseFactory {
  /**
   * Create a basic test course
   */
  static create(overrides: Partial<TestCourse> = {}): TestCourse {
    return generateTestCourse(overrides);
  }

  /**
   * Create a programming course
   */
  static createProgramming(overrides: Partial<TestCourse> = {}): TestCourse {
    return this.create({
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from scratch',
      category: 'programming',
      status: 'active',
      price: 99.99,
      ...overrides
    });
  }

  /**
   * Create a web development course
   */
  static createWebDev(overrides: Partial<TestCourse> = {}): TestCourse {
    return this.create({
      title: 'Full-Stack Web Development',
      description: 'Build modern web applications',
      category: 'web-development',
      status: 'active',
      price: 199.99,
      ...overrides
    });
  }

  /**
   * Create a data science course
   */
  static createDataScience(overrides: Partial<TestCourse> = {}): TestCourse {
    return this.create({
      title: 'Data Science with Python',
      description: 'Learn data analysis and machine learning',
      category: 'data-science',
      status: 'active',
      price: 299.99,
      ...overrides
    });
  }

  /**
   * Create a draft course
   */
  static createDraft(overrides: Partial<TestCourse> = {}): TestCourse {
    return this.create({
      title: 'Draft Course',
      description: 'This course is still being developed',
      category: 'programming',
      status: 'draft',
      price: 0,
      ...overrides
    });
  }

  /**
   * Create an archived course
   */
  static createArchived(overrides: Partial<TestCourse> = {}): TestCourse {
    return this.create({
      title: 'Archived Course',
      description: 'This course is no longer available',
      category: 'programming',
      status: 'archived',
      price: 0,
      ...overrides
    });
  }

  /**
   * Create multiple courses
   */
  static createMany(count: number, overrides: Partial<TestCourse> = {}): TestCourse[] {
    const courses: TestCourse[] = [];
    for (let i = 0; i < count; i++) {
      const course = this.create({
        title: `Test Course ${i}`,
        description: `Test course description ${i}`,
        ...overrides
      });
      courses.push(course);
    }
    return courses;
  }

  /**
   * Create courses with different statuses
   */
  static createWithStatuses(): TestCourse[] {
    return [
      this.createProgramming({ status: 'active' }),
      this.createWebDev({ status: 'draft' }),
      this.createDataScience({ status: 'archived' })
    ];
  }

  /**
   * Create courses with different categories
   */
  static createWithCategories(): TestCourse[] {
    return [
      this.createProgramming({ category: 'programming' }),
      this.createWebDev({ category: 'web-development' }),
      this.createDataScience({ category: 'data-science' }),
      this.create({ category: 'design', title: 'UI/UX Design' }),
      this.create({ category: 'business', title: 'Digital Marketing' })
    ];
  }
}

