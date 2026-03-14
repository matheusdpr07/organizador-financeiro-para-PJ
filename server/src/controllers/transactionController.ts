import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getTransactions = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const { description, amount, date, type, categoryId, status, costCenterId } = req.body;
  const { companyId } = req;
  
  if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

  try {
    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        date: new Date(date),
        type,
        categoryId,
        companyId,
        status: status || 'PAID',
        costCenterId,
      },
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, paymentDate } = req.body;
  const { companyId } = req;

  try {
    // Garantir que a transação pertence à empresa do usuário
    const transaction = await prisma.transaction.updateMany({
      where: { id, companyId },
      data: { 
        status: status || 'PAID',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status da transação' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { description, amount, date, type, categoryId, costCenterId, status } = req.body;
  const { companyId } = req;

  try {
    await prisma.transaction.updateMany({
      where: { id, companyId },
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        type,
        categoryId,
        costCenterId,
        status,
      },
    });
    res.json({ message: 'Transação atualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar transação' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    await prisma.transaction.deleteMany({ where: { id, companyId } });
    res.json({ message: 'Transação excluída' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir transação' });
  }
};

export const clearTransactions = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    await prisma.transaction.deleteMany({
      where: { companyId }
    });
    res.json({ message: 'Histórico zerado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao zerar histórico' });
  }
};
