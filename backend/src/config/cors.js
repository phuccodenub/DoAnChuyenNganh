/**
 * CORS Configuration
 * Cross-Origin Resource Sharing setup for HTTP and Socket.IO
 */

// Allowed origins based on environment
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use specific domains
    return [
      process.env.FRONTEND_URL,
      'https://lms.example.com',
      'https://www.lms.example.com'
    ].filter(Boolean); // Remove undefined values
  } else {
    // In development, allow localhost with different ports
    return [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173', // Vite default
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173'
    ];
  }
};

// HTTP CORS configuration for Express
const httpCors = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
    'X-User-Id'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page'
  ],
  maxAge: 86400 // 24 hours - how long browsers can cache preflight response
};

// Socket.IO CORS configuration
const socketCors = {
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST']
};

// CORS middleware for specific routes that need different settings
const strictCors = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Strict mode - don't allow requests without origin
    if (!origin) {
      return callback(new Error('Origin required for this endpoint'));
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy - strict mode'));
    }
  },
  credentials: true,
  methods: ['POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
};

// Preflight handler for complex CORS requests
const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    const allowedOrigins = getAllowedOrigins();
    const origin = req.get('Origin');
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Access-Token'
      );
      res.header('Access-Control-Max-Age', '86400');
      
      return res.status(200).end();
    } else {
      return res.status(403).json({ error: 'CORS preflight failed' });
    }
  }
  next();
};

module.exports = {
  httpCors,
  socketCors,
  strictCors,
  handlePreflight,
  getAllowedOrigins
};