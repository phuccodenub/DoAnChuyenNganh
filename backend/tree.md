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
├───logs
│       combined.log
│       combined1.log
│       combined2.log
│       error.log
│       error1.log
│       error2.log
│
├───middlewares
│       auth-rate-limit.middleware.ts
│       auth.middleware.ts
│       error.middleware.ts
│       logger.middleware.ts
│       validate-dto.middleware.ts
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
│       009-create-extended-lms-tables.ts
│       010-add-email-verified-at.ts
│       011-add-user-profile-columns.ts
│       index.ts
│       README.md
│
├───models
│       assignment-submission.model.ts
│       assignment.model.ts
│       associations-extended.ts
│       associations.ts
│       category.model.ts
│       chat-message.model.ts
│       course-statistics.model.ts
│       course.model.ts
│       enrollment.model.ts
│       final-grade.model.ts
│       grade-component.model.ts
│       grade.model.ts
│       index.ts
│       lesson-material.model.ts
│       lesson-progress.model.ts
│       lesson.model.ts
│       live-session-attendance.model.ts
│       live-session.model.ts
│       notification-recipient.model.ts
│       notification.model.ts
│       password-reset-token.model.ts
│       quiz-answer.model.ts
│       quiz-attempt.model.ts
│       quiz-option.model.ts
│       quiz-question.model.ts
│       quiz.model.ts
│       section.model.ts
│       user-activity-log.model.ts
│       user.model.ts
│
├───modules
│   ├───analytics
│   │       analytics.controller.ts
│   │       analytics.repository.ts
│   │       analytics.routes.ts
│   │       analytics.service.ts
│   │       analytics.types.ts
│   │       analytics.validate.ts
│   │       index.ts
│   │
│   ├───assignment
│   │       assignment.controller.ts
│   │       assignment.repository.ts
│   │       assignment.routes.ts
│   │       assignment.service.ts
│   │       assignment.types.ts
│   │       assignment.validate.ts
│   │       index.ts
│   │
│   ├───auth
│   │       auth.controller.ts
│   │       auth.repository.ts
│   │       auth.routes.ts
│   │       auth.service.ts
│   │       auth.types.ts
│   │       auth.validate.ts
│   │       index.ts
│   │
│   ├───chat
│   │       chat.controller.ts
│   │       chat.gateway.ts
│   │       chat.repository.ts
│   │       chat.routes.ts
│   │       chat.service.ts
│   │       chat.types.ts
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
│   ├───course-content
│   │       course-content.controller.ts
│   │       course-content.repository.ts
│   │       course-content.routes.ts
│   │       course-content.service.ts
│   │       course-content.types.ts
│   │       course-content.validate.ts
│   │       index.ts
│   │
│   ├───files
│   │       files.controller.ts
│   │       files.routes.ts
│   │       files.service.ts
│   │       files.types.ts
│   │       index.ts
│   │       upload.middleware.ts
│   │
│   ├───grade
│   │       grade.controller.ts
│   │       grade.repository.ts
│   │       grade.routes.ts
│   │       grade.service.ts
│   │       grade.types.ts
│   │       grade.validate.ts
│   │       index.ts
│   │
│   ├───livestream
│   │       index.ts
│   │       livestream.controller.ts
│   │       livestream.repository.ts
│   │       livestream.routes.ts
│   │       livestream.service.ts
│   │       livestream.types.ts
│   │       livestream.validate.ts
│   │
│   ├───notifications
│   │       index.ts
│   │       notifications.controller.ts
│   │       notifications.repository.ts
│   │       notifications.routes.ts
│   │       notifications.service.ts
│   │       notifications.types.ts
│   │       notifications.validate.ts
│   │
│   ├───quiz
│   │       index.ts
│   │       quiz.controller.ts
│   │       quiz.repository.ts
│   │       quiz.routes.ts
│   │       quiz.service.ts
│   │       quiz.types.ts
│   │       quiz.validate.ts
│   │
│   ├───user
│   │       index.ts
│   │       README.md
│   │       user.admin.controller.ts
│   │       user.admin.routes.ts
│   │       user.controller.ts
│   │       user.repository.ts
│   │       user.routes.ts
│   │       user.service.ts
│   │       user.types.ts
│   │       user.validate.ts
│   │
│   └───webrtc
│           index.ts
│           webrtc.gateway.ts
│           webrtc.service.ts
│           webrtc.types.ts
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
│       check-database-schema.ts
│       migrate.ts
│       reset-db-simple.ts
│       reset-db.ts
│       seed-database.ts
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
│           user-refactored.service.ts
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
│   │   ├───database
│   │   │       database.integration.test.ts
│   │   │
│   │   └───modules
│   │       └───user
│   │               user.admin.controller.test.ts
│   │
│   ├───unit
│   │   └───utils
│   │           hash.util.test.ts
│   │
│   └───utils
│           test.utils.ts
│
├───types
│   │   common.types.ts
│   │   error.d.ts
│   │   express.d.ts
│   │   index.ts
│   │   model.types.ts
│   │   repository.types.ts
│   │   sequelize.d.ts
│   │   type-utilities.ts
│   │   user.types.ts
│   │
│   └───dtos
│           auth.dto.ts
│           common.dto.ts
│           course.dto.ts
│           enrollment.dto.ts
│           grade.dto.ts
│           index.ts
│           quiz.dto.ts
│           user.dto.ts
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
│   │   model-extension.util.ts
│   │   object.util.ts
│   │   pagination.util.ts
│   │   response.util.ts
│   │   role.util.ts
│   │   secure.util.ts
│   │   token.util.ts
│   │   type.util.ts
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