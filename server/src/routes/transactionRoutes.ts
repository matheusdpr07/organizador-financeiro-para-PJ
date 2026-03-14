import { Router } from 'express';
import { getTransactions, createTransaction, updateTransactionStatus, updateTransaction, deleteTransaction, clearTransactions } from '../controllers/transactionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.delete('/clear', clearTransactions);
router.patch('/:id/status', updateTransactionStatus);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
