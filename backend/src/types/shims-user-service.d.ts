// Minimal shims to isolate user.service.ts during incremental hard-fail

declare module './user.types' {
  export namespace UserTypes {
    type UserPreferences = any;
    type UserSession = any;
    type UserAnalytics = any;
    type NotificationSettings = any;
    type PrivacySettings = any;
  }
  export type UserInstance = any;
}

declare module './user.types' {
  export namespace UserTypes {
    type UserProfile = any;
    type UserStats = any;
  }
}

declare module '../../services/global' {
  export const globalServices: any;
}

// Wildcard shims to avoid traversing real implementations
declare module '../../services/global/*' {
  const anyExport: any;
  export = anyExport;
}

declare module '../../constants/response.constants' {
  export const RESPONSE_CONSTANTS: {
    STATUS_CODE: any;
  };
}

declare module '../../middlewares/error.middleware' {
  export class ApiError extends Error {
    constructor(message?: string, statusCode?: number);
  }
}

declare module '../../errors' {
  export const ApiError: any;
  export const ErrorUtils: any;
}
declare module '../../errors/*' {
  const anyExport: any;
  export = anyExport;
}

declare module '../../utils/user.util' {
  export const userUtils: any;
}
declare module '../../utils/*' {
  const anyExport: any;
  export = anyExport;
}

declare module '@constants/app.constants' {
  export const APP_CONSTANTS: any;
}

declare module '../../constants/*' {
  const anyExport: any;
  export = anyExport;
}


