import { QueryInterface } from 'sequelize';

/**
 * Migration 027: Cho phép course_id nullable cho quizzes/assignments
 * và chuẩn bị cho nghiệp vụ course-level XOR lesson-level.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // quizzes: course_id nullable - sử dụng raw SQL để đảm bảo hoạt động đúng
  await queryInterface.sequelize.query(`
    ALTER TABLE quizzes 
    ALTER COLUMN course_id DROP NOT NULL;
  `);

  // assignments: course_id nullable - sử dụng raw SQL để đảm bảo hoạt động đúng
  await queryInterface.sequelize.query(`
    ALTER TABLE assignments 
    ALTER COLUMN course_id DROP NOT NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // quizzes: course_id NOT NULL
  await queryInterface.changeColumn('quizzes', 'course_id', {
    type: 'UUID',
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE',
  } as any);

  // assignments: course_id NOT NULL
  await queryInterface.changeColumn('assignments', 'course_id', {
    type: 'UUID',
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE',
  } as any);
}


