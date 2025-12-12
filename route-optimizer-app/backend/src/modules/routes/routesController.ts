import { Router, type Request, type Response, type NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { RoutesService } from './routesService';

export const routesRouter = Router();

routesRouter.use(authMiddleware);

routesRouter.post('/optimize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await RoutesService.optimizeAndCreateRoute(req.userId as string, req.body);
    res.status(201).json(route);
  } catch (error) {
    next(error);
  }
});

routesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = await RoutesService.listRoutes(req.userId as string);
    res.json(routes);
  } catch (error) {
    next(error);
  }
});

routesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await RoutesService.getRouteById(req.userId as string, req.params.id);
    res.json(route);
  } catch (error) {
    next(error);
  }
});

routesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await RoutesService.deleteRoute(req.userId as string, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default routesRouter;
