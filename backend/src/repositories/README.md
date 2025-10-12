# Repositories

This directory contains repository classes responsible for data access logic.

## UserRepository

The `UserRepository` class handles all database operations related to users:

- **Data Access Methods**: `findByEmail`, `findById`, `create`, `update`, `delete`
- **Query Methods**: `findAll`, `findByRole`, `getUserStats`
- **Utility Methods**: `updateLastLogin`, `updateTokenVersion`

### Usage

```typescript
import { UserRepository } from '../repositories/user.repository';

const userRepo = new UserRepository();
const user = await userRepo.findByEmail('user@example.com');
```

### Benefits

- **Separation of Concerns**: Business logic separated from data access
- **Testability**: Easy to mock for unit testing
- **Maintainability**: Centralized database operations
- **Flexibility**: Easy to switch between different data sources

## Structure
```
repositories/
├── user.repository.ts    # User-specific repository
├── auth.repository.ts    # Auth-specific repository (future)
└── course.repository.ts  # Course-specific repository (future)
```
