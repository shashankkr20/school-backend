// config/config.js
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  dbConfig: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'school_user',
    password: process.env.DB_PASSWORD || 'school_password',
    database: process.env.DB_NAME || 'school_management',
    ssl: isProduction ? { rejectUnauthorized: true } : false,
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  jwtConfig: {
    secret: process.env.JWT_SECRET || 'complex_jwt_secret_123',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    resetPasswordExpiration: process.env.JWT_RESET_PASSWORD_EXPIRATION || '10m'
  },
  emailConfig: {
    service: process.env.EMAIL_SERVICE || 'Gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM || 'no-reply@schoolapp.com'
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  rateLimits: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20 // limit each IP to 20 requests per windowMs
    },
    api: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  },
  corsOptions: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
    directory: process.env.LOG_DIR || 'logs'
  }
};