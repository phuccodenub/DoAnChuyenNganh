# Database Migrations

This directory contains database migration files for the LMS backend application.

## Overview

Migrations are used to manage database schema changes in a version-controlled manner. Each migration file represents a specific change to the database structure.

## Migration Files

### 001-create-users-table.ts
Creates the `users` table with all necessary fields for user management:
- Basic user information (email, username, password, names)
- Authentication fields (2FA, email verification, password reset)
- User status and role management
- Social login support
- User preferences and metadata

### 002-create-courses-table.ts
Creates the `courses` table for course management:
- Course information (title, description, instructor)
- Pricing and discount management
- Course metadata (category, level, language)
- Statistics (rating, student count, duration)
- Course status and visibility

### 003-create-enrollments-table.ts
Creates the `enrollments` table for student-course relationships:
- Enrollment tracking and status
- Payment information and methods
- Progress tracking and completion
- Certificate management
- Reviews and ratings

### 004-create-chat-messages-table.ts
Creates the `chat_messages` table for course discussions:
- Message content and types
- Reply threading support
- Message moderation (edit, delete, pin)
- Reactions and metadata
- Course-specific messaging

### 005-add-indexes-to-users-table.ts
Adds performance indexes to the users table:
- Unique indexes for email, username, phone
- Indexes for role, status, and verification tokens
- Performance indexes for common queries

### 006-add-indexes-to-courses-table.ts
Adds performance indexes to the courses table:
- Instructor and category indexes
- Status and rating indexes
- Composite indexes for course discovery
- Featured courses optimization

### 007-add-indexes-to-enrollments-table.ts
Adds performance indexes to the enrollments table:
- User and course relationship indexes
- Status and progress indexes
- Composite indexes for enrollment queries
- Unique constraint for user-course pairs

### 008-add-indexes-to-chat-messages-table.ts
Adds performance indexes to the chat messages table:
- Course and user message indexes
- Message type and status indexes
- Composite indexes for message queries
- Pinned messages optimization

## Usage

### Running Migrations

```bash
# Run all pending migrations
npm run migrate migrate

# Check migration status
npm run migrate status

# Rollback last migration
npm run migrate rollback

# Rollback all migrations
npm run migrate rollbackAll
```

### Migration Management

The `MigrationManager` class handles:
- Migration tracking in the `migrations` table
- Version control and execution order
- Rollback functionality
- Status reporting

### Migration Structure

Each migration file exports:
- `up`: Function to apply the migration
- `down`: Function to rollback the migration
- `version`: Unique version identifier
- `description`: Human-readable description

## Best Practices

1. **Always test migrations** on a development database first
2. **Never modify existing migrations** - create new ones instead
3. **Use descriptive names** for migration files
4. **Include rollback logic** for all migrations
5. **Add indexes** after creating tables for better performance
6. **Use transactions** for complex migrations
7. **Backup database** before running migrations in production

## Database Schema

The migrations create the following main tables:
- `users` - User accounts and authentication
- `courses` - Course information and metadata
- `enrollments` - Student-course relationships
- `chat_messages` - Course discussion messages
- `migrations` - Migration tracking table
- `seeders` - Seeder tracking table

## Indexes

Performance indexes are added for:
- Primary keys and foreign keys
- Unique constraints (email, username, phone)
- Common query patterns (status, role, category)
- Composite indexes for complex queries
- Sorting and filtering operations

## Troubleshooting

### Common Issues

1. **Migration fails**: Check database connection and permissions
2. **Rollback fails**: Ensure rollback logic is correct
3. **Index conflicts**: Check for existing indexes before adding
4. **Foreign key violations**: Ensure referenced tables exist

### Recovery

If migrations fail:
1. Check the error logs
2. Fix the migration file
3. Rollback if necessary
4. Re-run the migration

### Manual Intervention

For complex issues:
1. Connect to database directly
2. Check migration status in `migrations` table
3. Manually fix schema if needed
4. Update migration tracking accordingly
