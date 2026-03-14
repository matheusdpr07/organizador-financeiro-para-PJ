import { Router } from 'express';
import { getCategories, getCostCenters, createCategory } from '../controllers/setupController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/categories', getCategories);
router.get('/cost-centers', getCostCenters);
router.post('/categories', createCategory);

export default router;
