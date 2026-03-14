import { Router } from 'express';
import { getDRE, getCashFlow } from '../controllers/reportController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/dre', getDRE);
router.get('/cash-flow', getCashFlow);

export default router;
