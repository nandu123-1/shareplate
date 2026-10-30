import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database';
import { authRouter } from './routes/auth';
import { listingsRouter } from './routes/listings';
import { requestsRouter } from './routes/requests';
import { pickupsRouter } from './routes/pickups';
import { notificationsRouter } from './routes/notifications';
import { reportsRouter } from './routes/reports';
import { adminRouter } from './routes/admin';
import { analyticsRouter } from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize SQLite database tables
initDatabase();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SharePlate API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/pickups', pickupsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`SharePlate API Server running on http://localhost:${PORT}`);
});

export default app;
