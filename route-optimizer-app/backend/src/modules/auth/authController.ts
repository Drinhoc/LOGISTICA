import { Router, type Request, type Response, type NextFunction } from 'express';
import { AuthService } from './authService';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const result = await AuthService.register({ name, email, password });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
