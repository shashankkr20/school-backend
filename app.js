const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const { errorConverter, errorHandler } = require('./middleware/error.middleware');
const routes = require('./routes');
const { sequelize } = require('./config/db');

const app = express();

// 1. Initialize database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// 2. Middleware Stack

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Data sanitization
app.use(mongoSanitize()); // Against NoSQL injection
app.use(xss()); // Against XSS

// Prevent parameter pollution
app.use(hpp({
  whitelist: [ // Fields that can have duplicates
    'page',
    'limit',
    'sort',
    'fields'
  ]
}));

// 3. Routes
app.use('/api', routes);

// 4. Error Handling
app.use(errorConverter); // Convert to ApiError if needed
app.use(errorHandler); // Final error handler

// 5. Handle 404
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

module.exports = app;