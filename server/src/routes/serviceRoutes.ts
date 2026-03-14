import { Router } from 'express';
import { 
  getClients, createClient, updateClient, deleteClient,
  getServiceOrders, createServiceOrder, finalizeOS 
} from '../controllers/serviceController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Rotas de Clientes
router.get('/clients', getClients);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

// Rotas de Ordens de Serviço
router.get('/orders', getServiceOrders);
router.post('/orders', createServiceOrder);
router.patch('/orders/:id/finalize', finalizeOS);

export default router;
