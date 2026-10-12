import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env.js';
import { pool } from './db/pool.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Trust reverse proxy (Nginx on EC2)
app.set('trust proxy', 1);

// HTTP Logging (Morgan)
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// CORS Configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin reverse-proxied by Nginx)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Request origin not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 1. Health check endpoint (for AWS ALB/Target Group, EC2 monitoring, curl verification)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const dbRes = await pool.query('SELECT 1 AS alive');
    if (dbRes.rows[0]?.alive === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const isHealthy = dbStatus === 'connected';
  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    services: {
      api: 'healthy',
      database: dbStatus
    }
  });
});

// 2. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 3. Centralized 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup (only when invoked directly)
if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  // Bind to 127.0.0.1 in production to guarantee it is not exposed publicly bypassing Nginx
  const bindHost = config.nodeEnv === 'production' ? '127.0.0.1' : '0.0.0.0';
  
  app.listen(config.port, bindHost, () => {
    console.log(`=======================================================`);
    console.log(`  Harsh Electronics API Server running on http://${bindHost}:${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Health Check: http://${bindHost}:${config.port}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
