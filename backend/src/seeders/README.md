# Database Seeders

This directory contains database seeder files for populating the LMS backend application with sample data.

## Overview

Seeders are used to populate the database with initial data for development, testing, and demonstration purposes. Each seeder file contains sample data for specific tables.

## Seeder Files

### 001-seed-users.ts
Seeds the `users` table with sample user accounts:
- **Super Admin**: System administrator with full access
- **Admin**: Regular administrator account
- **Instructors**: 3 sample instructors with different specializations
- **Students**: 5 sample students with various backgrounds
- **Special Cases**: Pending verification and suspended users

**Sample Users:**
- `superadmin@example.com` - Super Admin (SuperAdmin123!)
- `admin@example.com` - Admin (Admin123!)
- `instructor1@example.com` - John Doe, Software Engineer (Instructor123!)
- `instructor2@example.com` - Jane Smith, Full-stack Developer (Instructor123!)
- `instructor3@example.com` - Mike Johnson, Data Scientist (Instructor123!)
- `student1@example.com` - Alice Brown, Aspiring Developer (Student123!)
- `student2@example.com` - Bob Wilson, CS Student (Student123!)
- `student3@example.com` - Carol Davis, Frontend Developer (Student123!)
- `student4@example.com` - David Miller, Backend Developer (Student123!)
- `student5@example.com` - Eva Garcia, Mobile Developer (Student123!)

### 002-seed-courses.ts
Seeds the `courses` table with sample courses:
- **React Development Course** - Intermediate level, paid, featured
- **Node.js Backend Development** - Intermediate level, paid, featured
- **Machine Learning Fundamentals** - Beginner level, paid, featured
- **Free JavaScript Basics** - Beginner level, free course
- **Advanced React Patterns** - Advanced level, paid
- **Draft Course** - Coming soon, not published

**Course Features:**
- Varied pricing and difficulty levels
- Different categories and subcategories
- Ratings and student counts
- Prerequisites and learning objectives
- Tags and metadata

### 003-seed-enrollments.ts
Seeds the `enrollments` table with sample enrollments:
- **Active Enrollments**: Students currently taking courses
- **Completed Enrollments**: Finished courses with certificates
- **Pending Enrollments**: Payment processing
- **Cancelled Enrollments**: Refunded courses

**Enrollment Data:**
- Progress tracking and completion status
- Payment information and methods
- Reviews and ratings
- Certificate issuance
- Access tracking

### 004-seed-chat-messages.ts
Seeds the `chat_messages` table with sample course discussions:
- **System Messages**: Welcome messages and announcements
- **Student Questions**: Common questions and discussions
- **Instructor Responses**: Helpful answers and guidance
- **Announcements**: Course updates and new content
- **Pinned Messages**: Important information

**Message Types:**
- Text messages and replies
- System announcements
- Pinned important messages
- Course-specific discussions

## Usage

### Running Seeders

```bash
# Run all pending seeders
npm run migrate seed

# Check seeder status
npm run migrate seedStatus

# Rollback last seeder
npm run migrate seedRollback

# Rollback all seeders
npm run migrate seedRollbackAll
```

### Seeder Management

The `SeederManager` class handles:
- Seeder tracking in the `seeders` table
- Version control and execution order
- Rollback functionality
- Status reporting

### Seeder Structure

Each seeder file exports:
- `up`: Function to apply the seeder
- `down`: Function to rollback the seeder
- `version`: Unique version identifier
- `description`: Human-readable description

## Sample Data Overview

### Users (12 total)
- 1 Super Admin
- 1 Admin
- 3 Instructors
- 5 Active Students
- 1 Pending User
- 1 Suspended User

### Courses (6 total)
- 3 Featured Paid Courses
- 1 Free Course
- 1 Advanced Course
- 1 Draft Course

### Enrollments (12 total)
- 6 Active Enrollments
- 4 Completed Enrollments
- 1 Pending Enrollment
- 1 Cancelled Enrollment

### Chat Messages (22 total)
- 4 System Messages
- 18 User Messages
- 4 Pinned Messages
- Multiple Reply Threads

## Development Use Cases

### 1. **Development Environment**
- Quick database setup for new developers
- Consistent sample data across environments
- Testing different user roles and permissions

### 2. **Testing**
- Unit tests with known data
- Integration tests with realistic scenarios
- Performance testing with sample data

### 3. **Demonstration**
- Showcase application features
- User interface testing
- Client presentations

### 4. **Training**
- Onboarding new team members
- Learning application functionality
- Understanding data relationships

## Data Relationships

### User-Course Relationships
- Instructors create and manage courses
- Students enroll in courses
- Progress tracking and completion
- Reviews and ratings

### Course-Enrollment Relationships
- Multiple students per course
- Different enrollment statuses
- Payment and access management
- Certificate issuance

### Chat Message Relationships
- Course-specific discussions
- User participation tracking
- Message threading and replies
- Moderation and pinning

## Customization

### Adding New Seeders
1. Create new seeder file in `seeders/` directory
2. Follow naming convention: `XXX-seed-description.ts`
3. Export `up` and `down` functions
4. Add to seeder registry in `index.ts`
5. Test with `npm run migrate seed`

### Modifying Existing Seeders
1. Update seeder file content
2. Test rollback functionality
3. Update documentation
4. Consider data migration needs

### Environment-Specific Data
- Development: Full sample data
- Testing: Minimal test data
- Production: No seeders (empty database)
- Staging: Production-like data

## Best Practices

1. **Use realistic data** that represents actual use cases
2. **Include edge cases** like suspended users, draft courses
3. **Maintain relationships** between different data types
4. **Use consistent naming** and formatting
5. **Include rollback logic** for all seeders
6. **Test seeder execution** and rollback functionality
7. **Document data relationships** and dependencies
8. **Keep data current** with application changes

## Troubleshooting

### Common Issues

1. **Seeder fails**: Check data validity and constraints
2. **Rollback fails**: Ensure rollback logic is correct
3. **Foreign key violations**: Ensure referenced data exists
4. **Duplicate data**: Check for existing records

### Recovery

If seeders fail:
1. Check the error logs
2. Fix the seeder file
3. Rollback if necessary
4. Re-run the seeder

### Manual Intervention

For complex issues:
1. Connect to database directly
2. Check seeder status in `seeders` table
3. Manually fix data if needed
4. Update seeder tracking accordingly

## Security Considerations

### Password Security
- All sample passwords are clearly marked as test passwords
- Use strong passwords in production
- Never use real user credentials in seeders

### Data Privacy
- Use fictional names and email addresses
- Avoid real personal information
- Use placeholder data for sensitive fields

### Access Control
- Test different user roles and permissions
- Verify access restrictions work correctly
- Ensure admin functions are properly protected
