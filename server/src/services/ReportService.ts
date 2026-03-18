import prisma from '../config/prisma';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

class ReportService {
  async getDRE(companyId: string, month: number, year: number) {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        status: 'PAID',
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const getSum = (nature: string) => 
      transactions
        .filter(t => t.category.accountingNature === nature)
        .reduce((acc, t) => acc + t.amount, 0);

    const rawData = {
      grossRevenue: getSum('REVENUE'),
      deductions: getSum('DEDUCTION'),
      directCosts: getSum('DIRECT_COST'),
      operatingExpenses: getSum('OPERATING_EXPENSE'),
      financialResult: getSum('FINANCIAL'),
    };

    const netRevenue = rawData.grossRevenue - rawData.deductions;
    const grossProfit = netRevenue - rawData.directCosts;
    const ebitda = grossProfit - rawData.operatingExpenses;
    const netProfit = ebitda - rawData.financialResult;

    return {
      ...rawData,
      netRevenue,
      grossProfit,
      ebitda,
      netProfit,
    };
  }

  async getCashFlow(companyId: string, month: number, year: number) {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayTransactions = transactions.filter(t => 
        format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const incomes = dayTransactions
        .filter(t => t.type === 'INCOME' && t.status === 'PAID')
        .reduce((acc, t) => acc + t.amount, 0);
        
      const expenses = dayTransactions
        .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
        .reduce((acc, t) => acc + t.amount, 0);

      return {
        date: format(day, 'yyyy-MM-dd'),
        incomes,
        expenses,
        balance: incomes - expenses,
      };
    });
  }
}

export default new ReportService();
