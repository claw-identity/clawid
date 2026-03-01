import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { globalRateLimit } from './middleware/rateLimit';
import { errorHandler, notFound } from './middleware/errorHandler';
import router from './routes';
import path from 'path';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Global rate limit
app.use(globalRateLimit);

// skill.md route (plain text)
app.get('/skill.md', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, '..', 'public', 'skill.md'));
});

// API routes
app.use('/api/v1', router);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
