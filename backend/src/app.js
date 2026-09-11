/**
 * Career360 Express Application
 *
 * Sets up all middleware, security headers, CORS, and routes.
 * The actual HTTP server is in server.js.
 */

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');

const { env }          = require('./config/env');
const { connectDatabase } = require('./config/database');
const requestLogger    = require('./middleware/requestLogger');
const notFound         = require('./middleware/notFound');
const errorHandler     = require('./middleware/errorHandler');
const apiRoutes        = require('./routes/index');
const logger           = require('./utils/logger');

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── Cookie parser ───────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowed = [
      env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin '${origin}' not allowed.`));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max:      env.isDevelopment ? 50000 : env.RATE_LIMIT_MAX,
  skip:     () => env.isDevelopment,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: {
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

app.use('/api/', limiter);

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name:    'Career360 API',
    version: '0.1.0',
    phase:   'Phase 0 — Foundation',
    docs:    '/api/v1/health',
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Connect to database ─────────────────────────────────────────────────────
connectDatabase().catch((err) => logger.warn(`DB init skipped: ${err.message}`));

module.exports = app;
