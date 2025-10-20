// Shims to isolate shared and utils without pulling full app graph

declare module '../middlewares/*' {
  const anyExport: any;
  export = anyExport;
}

declare module '../constants/*' {
  const anyExport: any;
  export = anyExport;
}

declare module '../config/*' {
  const anyExport: any;
  export = anyExport;
}

declare module '../utils/logger.util' {
  const logger: any;
  export default logger;
}

declare module 'winston' {
  const anyExport: any;
  export = anyExport;
}

declare module 'path' {
  const anyExport: any;
  export = anyExport;
}

declare module 'express' {
  export interface Request { [key: string]: any }
  export interface Response { [key: string]: any }
  export interface NextFunction { (err?: any): void }
}

declare var process: any;


