PS H:\DACN\backend> npm run build

> backend@1.0.0 build
> tsc

src/controllers/user.controller.ts:79:73 - error TS2339: Property 'users' does not exist on type '{ data: UserInstance[]; pagination: { page: number; limit: number; total: number; totalPages: number; }; }'.

79     sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, result.users, RESPONSE_CONSTANTS.STATUS_CODE.OK, result.pagination);
                                                                           ~~~~~

src/controllers/user.controller.ts:79:115 - error TS2345: Argument of type '{ page: number; limit: number; total: number; totalPages: number; }' is not assignable to parameter of type 'ApiMetaDTO'.
  Property 'timestamp' is missing in type '{ page: number; limit: number; total: number; totalPages: number; }' but required in type 'ApiMetaDTO'.

79     sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, result.users, RESPONSE_CONSTANTS.STATUS_CODE.OK, result.pagination);
                                                                                         
                            ~~~~~~~~~~~~~~~~~

  src/types/dtos/common.dto.ts:35:3
    35   timestamp: string;
         ~~~~~~~~~
    'timestamp' is declared here.

src/modules/assignment/assignment.repository.ts:186:7 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(this: ModelStatic<AssignmentSubmissionInstance>, options: NonNullFindOptions<AssignmentSubmissionAttributes>): Promise<...>', gave the following error.      
    Type '{ assignment_id: string; status: string; score: { [OpTypes.not]: null; }; }' is not assignable to type 'WhereOptions<AssignmentSubmissionAttributes> | undefined'.      
      Types of property 'score' are incompatible.
        Type '{ [OpTypes.not]: null; }' is not assignable to type 'WhereAttributeHashValue<number | undefined>'.
          Types of property '[Op.not]' are incompatible.
            Type 'null' is not assignable to type 'string | number | boolean | Date | Fn | Col | Literal | { [OpTypes.col]: string; } | Cast | Buffer<ArrayBufferLike> | ... 11 more ... | undefined'.
  Overload 2 of 2, '(this: ModelStatic<AssignmentSubmissionInstance>, options?: FindOptions<AssignmentSubmissionAttributes> | undefined): Promise<...>', gave the following error.
    Type '{ assignment_id: string; status: string; score: { [OpTypes.not]: null; }; }' is not assignable to type 'WhereOptions<AssignmentSubmissionAttributes> | undefined'.      
      Types of property 'score' are incompatible.
        Type '{ [OpTypes.not]: null; }' is not assignable to type 'WhereAttributeHashValue<number | undefined>'.
          Types of property '[Op.not]' are incompatible.
            Type 'null' is not assignable to type 'string | number | boolean | Date | Fn | Col | Literal | { [OpTypes.col]: string; } | Cast | Buffer<ArrayBufferLike> | ... 11 more ... | undefined'.

186       where: {
          ~~~~~

  node_modules/sequelize/types/model.d.ts:55:3
    55   where?: WhereOptions<TAttributes>;
         ~~~~~
    The expected type comes from property 'where' which is declared here on type 'NonNullFindOptions<AssignmentSubmissionAttributes>'

src/modules/auth/auth.service.ts:59:55 - error TS2345: Argument of type 'UserProfile' is not assignable to parameter of type 'UserInstance'.
  Type 'UserProfile' is missing the following properties from type 'UserInstance': _attributes, dataValues, _creationAttributes, isNewRecord, and 27 more.

59       await globalServices.user.cacheUser(newUser.id, userProfile);
                                                         ~~~~~~~~~~~

src/modules/auth/auth.service.ts:149:52 - error TS2345: Argument of type 'UserProfile' is not assignable to parameter of type 'UserInstance'.
  Type 'UserProfile' is missing the following properties from type 'UserInstance': _attributes, dataValues, _creationAttributes, isNewRecord, and 27 more.

149       await globalServices.user.cacheUser(user.id, userProfile);
                                                       ~~~~~~~~~~~

src/modules/course-content/course-content.repository.ts:246:7 - error TS2322: Type '{ started_at: Date; last_accessed_at: Date; }' is not assignable to type 'Optional<LessonProgressCreationAttributes, NullishPropertiesOf<LessonProgressCreationAttributes>>'.
  Type '{ started_at: Date; last_accessed_at: Date; }' is missing the following properties from type 'Omit<LessonProgressCreationAttributes, NullishPropertiesOf<LessonProgressCreationAttributes>>': user_id, lesson_id

246       defaults: {
          ~~~~~~~~

  node_modules/sequelize/types/model.d.ts:992:3
    992   defaults?: TCreationAttributes;
          ~~~~~~~~
    The expected type comes from property 'defaults' which is declared here on type 'FindOrCreateOptions<LessonProgressAttributes, Optional<LessonProgressCreationAttributes, NullishPropertiesOf<LessonProgressCreationAttributes>>>'

src/modules/grade/grade.service.ts:24:62 - error TS2345: Argument of type 'CreateGradeComponentDto' is not assignable to parameter of type 'CreateGradeComponentDTO'.
  Property 'component_type' is missing in type 'CreateGradeComponentDto' but required in type 'CreateGradeComponentDTO'.

24       const component = await this.repo.createGradeComponent(dto);
                                                                ~~~

  src/types/dtos/grade.dto.ts:84:3
    84   component_type: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation' | 'other';
         ~~~~~~~~~~~~~~
    'component_type' is declared here.

src/modules/notifications/notifications.repository.ts:30:40 - error TS2339: Property 'markAllAsRead' does not exist on type 'NonConstructor<typeof Model> & (new () => Model<any, any>) & { getUserNotifications(this: ModelCtor<...>, userId: string, options?: { includeRead?: boolean | undefined; includeArchived?: boolean | undefined; limit?: number | undefined; offset?: number | undefined; category?: string | undefined; }): Promise<...>; get...'.

30     return await NotificationRecipient.markAllAsRead(userId);
                                          ~~~~~~~~~~~~~

src/modules/notifications/notifications.repository.ts:34:40 - error TS2339: Property 'archiveOldNotifications' does not exist on type 'NonConstructor<typeof Model> & (new () => Model<any, any>) & { getUserNotifications(this: ModelCtor<...>, userId: string, options?: { includeRead?: boolean | undefined; includeArchived?: boolean | undefined; limit?: number | undefined; offset?: number | undefined; category?: string | undefined; }): Promise<...>; get...'.

34     return await NotificationRecipient.archiveOldNotifications(userId, days);
                                          ~~~~~~~~~~~~~~~~~~~~~~~

src/modules/notifications/notifications.service.ts:17:57 - error TS2339: Property 'id' does not exist on type 'Model<any, any>'.

17       await this.repo.bulkCreateRecipients(notification.id, recipient_ids);
                                                           ~~

src/modules/notifications/notifications.service.ts:19:7 - error TS18046: 'notifData' is of type 'unknown'.

19       notifData.total_recipients = recipient_ids.length;
         ~~~~~~~~~

src/modules/quiz/quiz.repository.ts:66:31 - error TS2769: No overload matches this call. 
  Overload 1 of 2, '(this: ModelStatic<...>, values: { id?: string | Fn | Col | Literal | undefined; quiz_id?: string | Fn | Col | Literal | undefined; question_text?: string | Fn | Col | Literal | undefined; ... 5 more ...; updated_at?: Date | ... 3 more ... | undefined; }, options: Omit<...> & { ...; }): Promise<...>', gave the following error.        
    Argument of type 'UpdateQuizQuestionDTO' is not assignable to parameter of type '{ id?: string | Fn | Col | Literal | undefined; quiz_id?: string | Fn | Col | Literal | undefined; question_text?: string | Fn | Col | Literal | undefined; ... 5 more ...; updated_at?: Date | ... 3 more ... | undefined; }'.
      Types of property 'question_type' are incompatible.
        Type '"multiple_choice" | "true_false" | "short_answer" | "essay" | undefined' is not assignable to type '"single_choice" | "multiple_choice" | "true_false" | Fn | Col | Literal | undefined'.
          Type '"short_answer"' is not assignable to type '"single_choice" | "multiple_choice" | "true_false" | Fn | Col | Literal | undefined'.
  Overload 2 of 2, '(this: ModelStatic<...>, values: { id?: string | Fn | Col | Literal | undefined; quiz_id?: string | Fn | Col | Literal | undefined; question_text?: string | Fn | Col | Literal | undefined; ... 5 more ...; updated_at?: Date | ... 3 more ... | undefined; }, options: UpdateOptions<...>): Promise<...>', gave the following error.
    Argument of type 'UpdateQuizQuestionDTO' is not assignable to parameter of type '{ id?: string | Fn | Col | Literal | undefined; quiz_id?: string | Fn | Col | Literal | undefined; question_text?: string | Fn | Col | Literal | undefined; ... 5 more ...; updated_at?: Date | ... 3 more ... | undefined; }'.
      Types of property 'question_type' are incompatible.
        Type '"multiple_choice" | "true_false" | "short_answer" | "essay" | undefined' is not assignable to type '"single_choice" | "multiple_choice" | "true_false" | Fn | Col | Literal | undefined'.
          Type '"short_answer"' is not assignable to type '"single_choice" | "multiple_choice" | "true_false" | Fn | Col | Literal | undefined'.

66     await QuizQuestion.update(data, { where: { id: questionId } });
                                 ~~~~


src/modules/quiz/quiz.service.ts:120:66 - error TS2345: Argument of type 'Partial<CreateQuestionDto>' is not assignable to parameter of type 'UpdateQuizQuestionDTO'.
  Types of property 'question_type' are incompatible.
    Type '"single_choice" | "multiple_choice" | "true_false" | undefined' is not assignable to type '"multiple_choice" | "true_false" | "short_answer" | "essay" | undefined'.    
      Type '"single_choice"' is not assignable to type '"multiple_choice" | "true_false" | "short_answer" | "essay" | undefined'.

120       const updated = await this.repo.updateQuestion(questionId, data);
                                                                     ~~~~

src/modules/quiz/quiz.service.ts:158:60 - error TS2345: Argument of type 'CreateOptionDto' is not assignable to parameter of type 'CreateQuizOptionDTO'.
  Types of property 'is_correct' are incompatible.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.

158       const option = await this.repo.addOption(questionId, dto);
                                                               ~~~

src/modules/quiz/quiz.service.ts:228:9 - error TS2322: Type 'unknown' is not assignable to type 'QuizAttemptDto'.

228         return attemptData;
            ~~~~~~

src/modules/quiz/quiz.service.ts:236:7 - error TS2322: Type 'unknown' is not assignable to type 'QuizAttemptDto'.

236       return attemptData;
          ~~~~~~

src/modules/quiz/quiz.service.ts:261:11 - error TS18046: 'quizData' is of type 'unknown'.

261       if (quizData.time_limit_minutes) {
              ~~~~~~~~

src/modules/quiz/quiz.service.ts:263:27 - error TS18046: 'quizData' is of type 'unknown'.

263         if (timeElapsed > quizData.time_limit_minutes) {
                              ~~~~~~~~

src/modules/quiz/quiz.service.ts:269:64 - error TS2345: Argument of type 'QuizAnswerDto[]' is not assignable to parameter of type 'SubmitQuizAnswerDTO[]'.
  Type 'QuizAnswerDto' is not assignable to type 'SubmitQuizAnswerDTO'.
    Types of property 'selected_option_ids' are incompatible.
      Type 'string[] | undefined' is not assignable to type 'string[]'.
        Type 'undefined' is not assignable to type 'string[]'.

269       const answers = await this.repo.submitAnswers(attemptId, dto.answers);
                                                                   ~~~~~~~~~~~

src/modules/quiz/quiz.service.ts:273:11 - error TS18046: 'quizData' is of type 'unknown'.

273       if (quizData.auto_grade) {
              ~~~~~~~~

src/modules/user/user.controller.ts:75:73 - error TS2345: Argument of type '{ fieldname: string; originalname: string; encoding: string; mimetype: string; size: number; destination: string; filename: string; path: string; buffer: Buffer<ArrayBufferLike>; }' is not assignable to parameter of type 'File'.
  Property 'stream' is missing in type '{ fieldname: string; originalname: string; encoding: string; mimetype: string; size: number; destination: string; filename: string; path: string; buffer: Buffer<ArrayBufferLike>; }' but required in type 'File'.

75       const result = await this.userModuleService.uploadAvatar(userId!, file);        
                                                                           ~~~~

  node_modules/@types/multer/index.d.ts:27:17
    27                 stream: Readable;
                       ~~~~~~
    'stream' is declared here.


Found 21 errors in 10 files.

Errors  Files
     2  src/controllers/user.controller.ts:79
     1  src/modules/assignment/assignment.repository.ts:186
     2  src/modules/auth/auth.service.ts:59
     1  src/modules/course-content/course-content.repository.ts:246
     1  src/modules/grade/grade.service.ts:24
     2  src/modules/notifications/notifications.repository.ts:30
     2  src/modules/notifications/notifications.service.ts:17
     1  src/modules/quiz/quiz.repository.ts:66
     8  src/modules/quiz/quiz.service.ts:120
     1  src/modules/user/user.controller.ts:75