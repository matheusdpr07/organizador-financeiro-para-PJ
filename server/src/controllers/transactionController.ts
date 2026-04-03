import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import transactionService from '../services/transactionService';
import { z } from 'zod';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const transactions = await transactionService.getAll(String(companyId));
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const transaction = await transactionService.create({ ...req.body, companyId: String(companyId) });
    res.status(201).json(transaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Erro de validação', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, paymentDate } = req.body;
  const { companyId } = req;

  try {
    const result = await transactionService.updateStatus(String(id), String(companyId), status, paymentDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status da transação' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    const result = await transactionService.update(String(id), String(companyId), req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar transação' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    await transactionService.delete(String(id), String(companyId));
    res.json({ message: 'Transação excluída' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir transação' });
  }
};

export const clearTransactions = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    await transactionService.clearAll(String(companyId));
    res.json({ message: 'Histórico zerado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao zerar histórico' });
  }
};
