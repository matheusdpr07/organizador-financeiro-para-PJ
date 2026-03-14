import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getDRE = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  const { companyId } = req;

  if (!month || !year || !companyId) {
    return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios' });
  }

  const startDate = startOfMonth(new Date(Number(year), Number(month) - 1));
  const endDate = endOfMonth(startDate);

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        status: 'PAID',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    const dre = {
      grossRevenue: transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
      variableCosts: transactions.filter(t => t.type === 'EXPENSE' && t.category.name.toLowerCase().includes('custo')).reduce((acc, t) => acc + t.amount, 0),
      fixedExpenses: transactions.filter(t => t.type === 'EXPENSE' && !t.category.name.toLowerCase().includes('custo')).reduce((acc, t) => acc + t.amount, 0),
    };

    const netProfit = dre.grossRevenue - dre.variableCosts - dre.fixedExpenses;

    res.json({
      ...dre,
      grossProfit: dre.grossRevenue - dre.variableCosts,
      netProfit,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular DRE' });
  }
};

export const getCashFlow = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  const { companyId } = req;

  if (!month || !year || !companyId) {
    return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios' });
  }

  const startDate = startOfMonth(new Date(Number(year), Number(month) - 1));
  const endDate = endOfMonth(startDate);

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const cashFlow = days.map(day => {
      const dayTransactions = transactions.filter(t => 
        format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const incomes = dayTransactions.filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
      const expenses = dayTransactions.filter(t => t.type === 'EXPENSE' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);

      return {
        date: format(day, 'yyyy-MM-dd'),
        incomes,
        expenses,
        balance: incomes - expenses,
      };
    });

    res.json(cashFlow);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular Fluxo de Caixa' });
  }
};
