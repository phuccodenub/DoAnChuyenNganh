# Documentation

This folder contains API documentation and guides.

## Structure
```
docs/
├── api/                      # API documentation
│   ├── auth.md              # Authentication endpoints
│   ├── user.md              # User management endpoints
│   ├── course.md            # Course endpoints
│   └── openapi.yaml         # OpenAPI specification
├── guides/                   # Development guides
│   ├── getting-started.md   # Getting started guide
│   ├── architecture.md      # Architecture overview
│   ├── database.md          # Database design
│   └── deployment.md         # Deployment guide
└── examples/                 # Code examples
    ├── auth-examples.md
    └── api-examples.md
```

## Documentation Generation
```bash
npm run docs:generate    # Generate API docs from OpenAPI
npm run docs:serve       # Serve documentation locally
npm run docs:build       # Build static documentation
```

## API Documentation
- OpenAPI 3.0 specification
- Interactive API explorer
- Request/Response examples
- Authentication details
