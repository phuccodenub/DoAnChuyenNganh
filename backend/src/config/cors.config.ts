import cors, { CorsOptions } from 'cors';
import env from './env.config';

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and any origin in the whitelist
    if (!origin || env.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  methods: env.cors.allowedMethods,
  allowedHeaders: env.cors.allowedHeaders,
  credentials: env.cors.allowCredentials,
  optionsSuccessStatus: 204
};

export const corsMiddleware = cors(corsOptions);
export const getCorsOptions = (): CorsOptions => corsOptions;


