import { Router, type Request, type Response, type NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { CostSettingsService } from './costSettingsService';

export const costSettingsRouter = Router();

costSettingsRouter.use(authMiddleware);

costSettingsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await CostSettingsService.getCostSettings(req.userId as string);
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

costSettingsRouter.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await CostSettingsService.upsertCostSettings(req.userId as string, req.body);
    res.json(settings);
  } catch (error) {
    next(error);
  }
});
