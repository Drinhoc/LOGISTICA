import { Router, type Request, type Response, type NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { DriversService } from './driversService';

export const driversRouter = Router();

driversRouter.use(authMiddleware);

driversRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await DriversService.listDrivers(req.userId as string);
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

driversRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await DriversService.createDriver(req.userId as string, req.body);
    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
});

driversRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await DriversService.updateDriver(req.userId as string, req.params.id, req.body);
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

driversRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await DriversService.deleteDriver(req.userId as string, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
