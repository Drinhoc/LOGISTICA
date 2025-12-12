import { Router, type Request, type Response, type NextFunction } from 'express';
import { BusinessService } from './businessService';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const businessRouter = Router();

businessRouter.use(authMiddleware);

businessRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await BusinessService.getBusiness(req.userId as string);
    res.json(business);
  } catch (error) {
    next(error);
  }
});

businessRouter.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await BusinessService.upsertBusinessForUser(req.userId as string, req.body);
    res.json(business);
  } catch (error) {
    next(error);
  }
});
