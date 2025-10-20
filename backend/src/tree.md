src
│   app.ts
│   server.ts
│   
├───api
│   │   index.ts
│   │   routes.ts
│   │   
│   ├───v1
│   │   │   index.ts
│   │   │   
│   │   └───routes
│   │           auth.routes.ts
│   │           index.ts
│   │           user.routes.ts
│   │           
│   ├───v2
│   │   │   index.ts
│   │   │   
│   │   └───routes
│   │           auth.routes.ts
│   │           index.ts
│   │           user.routes.ts
│   │           
│   └───versioning
│           index.ts
│           version.config.ts
│           version.manager.ts
│           version.routes.ts
│           
├───cache
│   │   cache.manager.ts
│   │   cache.middleware.ts
│   │   index.ts
│   │   
│   └───strategies
│           cache.strategy.ts
│           hybrid.strategy.ts
│           memory.strategy.ts
│           redis.strategy.ts
│           
├───config
│       database.config.js
│       db.ts
│       index.ts
│       jwt.config.ts
│       mail.config.ts
│       redis.config.ts
│       swagger.config.ts
│       
├───constants
│       app.constants.ts
│       response.constants.ts
│       roles.enum.ts
│       user.constants.ts
│       
├───controllers
│       user.controller.ts
│       
├───docs
│       README.md
│       
├───errors
│       api.error.ts
│       authentication.error.ts
│       authorization.error.ts
│       base.error.ts
│       database.error.ts
│       error.constants.ts
│       error.factory.ts
│       error.handler.ts
│       error.utils.ts
│       external-service.error.ts
│       file.error.ts
│       index.ts
│       validation.error.ts
│       
├───middlewares
│       auth-rate-limit.middleware.ts
│       auth.middleware.ts
│       error.middleware.ts
│       logger.middleware.ts
│       validate.middleware.ts
│       
├───migrations
│       001-create-users-table.ts
│       002-create-courses-table.ts
│       003-create-enrollments-table.ts
│       004-create-chat-messages-table.ts
│       005-add-indexes-to-users-table.ts
│       006-add-indexes-to-courses-table.ts
│       007-add-indexes-to-enrollments-table.ts
│       008-add-indexes-to-chat-messages-table.ts
│       index.ts
│       README.md
│       
├───models
│       chat-message.model.ts
│       course.model.ts
│       enrollment.model.ts
│       index.ts
│       user.model.ts
│       
├───modules
│   ├───auth
│   │       auth.controller.ts
│   │       auth.repository.ts
│   │       auth.routes.ts
│   │       auth.service.ts
│   │       auth.types.ts
│   │       auth.validate.ts
│   │       index.ts
│   │       
│   ├───course
│   │       course.controller.ts
│   │       course.repository.ts
│   │       course.routes.ts
│   │       course.service.ts
│   │       course.types.ts
│   │       course.validate.ts
│   │       index.ts
│   │       
│   └───user
│           index.ts
│           user.controller.ts
│           user.repository.ts
│           user.routes.ts
│           user.service.ts
│           user.types.ts
│           user.validate.ts
│           
├───monitoring
│   │   index.ts
│   │   
│   ├───health
│   │       health.controller.ts
│   │       health.routes.ts
│   │       health.service.ts
│   │       index.ts
│   │       
│   └───metrics
│           index.ts
│           metrics.controller.ts
│           metrics.middleware.ts
│           metrics.routes.ts
│           metrics.service.ts
│           
├───repositories
│       base.repository.ts
│       enrollment.repository.ts
│       index.ts
│       README.md
│       user.repository.ts
│       
├───routes
│       user.routes.ts
│       
├───scripts
│       migrate.ts
│       reset-db-simple.ts
│       reset-db.ts
│       setup-db-simple.ts
│       setup-db.ts
│       
├───seeders
│       001-seed-users.ts
│       002-seed-courses.ts
│       003-seed-enrollments.ts
│       004-seed-chat-messages.ts
│       index.ts
│       README.md
│       
├───services
│   └───global
│           account-lockout.service.ts
│           auth.service.ts
│           cache.service.ts
│           email.service.ts
│           file.service.ts
│           index.ts
│           password-security.service.ts
│           session-management.service.ts
│           two-factor.service.ts
│           user.service.ts
│           
├───shared
│   │   index.ts
│   │   
│   └───base
│           base.controller.ts
│           
├───swagger
│   │   swagger.spec.ts
│   │   
│   ├───paths
│   │       auth.paths.ts
│   │       user.paths.ts
│   │       
│   └───schemas
│           auth.schema.ts
│           user.schema.ts
│           
├───tests
│   │   README.md
│   │   setup.ts
│   │   
│   ├───factories
│   │       course.factory.ts
│   │       user.factory.ts
│   │       
│   ├───integration
│   │   │   test.env
│   │   │   
│   │   ├───api
│   │   │       auth.integration.test.ts
│   │   │       user.integration.test.ts
│   │   │       
│   │   └───database
│   │           database.integration.test.ts
│   │           
│   ├───unit
│   │   └───utils
│   │           hash.util.test.ts
│   │           
│   └───utils
│           test.utils.ts
│           
├───types
│       common.types.ts
│       user.types.ts
│       
├───utils
│   │   bcrypt.util.ts
│   │   constants.util.ts
│   │   date.util.ts
│   │   file.util.ts
│   │   hash.util.ts
│   │   index.ts
│   │   jwt.util.ts
│   │   logger.util.ts
│   │   object.util.ts
│   │   pagination.util.ts
│   │   response.util.ts
│   │   role.util.ts
│   │   secure.util.ts
│   │   token.util.ts
│   │   user.util.ts
│   │   validators.util.ts
│   │   
│   ├───string
│   │       crypto.util.ts
│   │       extract.util.ts
│   │       format.util.ts
│   │       index.ts
│   │       mask.util.ts
│   │       normalize.util.ts
│   │       
│   └───tests
│           index.ts
│           role.test.ts
│           string.test.ts
│           user.test.ts
│           validators.test.ts
│           
└───validates
        auth.validate.ts
        base.validate.ts
        course.validate.ts
        file.validate.ts
        index.ts
        user.validate.ts