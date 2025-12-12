import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/authController';
import { businessRouter } from './modules/business/businessController';
import { costSettingsRouter } from './modules/costSettings/costSettingsController';
import { driversRouter } from './modules/drivers/driversController';
import { routesRouter } from './modules/routes/routesController';
import { authMiddleware } from './middlewares/authMiddleware';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/business', authMiddleware, businessRouter);
app.use('/api/cost-settings', authMiddleware, costSettingsRouter);
app.use('/api/drivers', authMiddleware, driversRouter);
app.use('/api/routes', authMiddleware, routesRouter);

app.use(errorHandler);

export { app };
