import 'dotenv/config';
import { CourseRepository } from '../src/modules/course/course.repository';

(async () => {
  try {
    console.log('=== Testing Course Repository Direct ===\n');
    
    const repo = new CourseRepository();
    
    const result = await repo.findAllWithPagination({
      page: 1,
      limit: 10,
    });
    
    console.log(`Total courses found: ${result.pagination.total}\n`);
    
    result.data.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Created: ${course.created_at}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
