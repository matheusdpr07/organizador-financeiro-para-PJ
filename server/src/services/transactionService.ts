import prisma from '../config/prisma';
import { z } from 'zod';

// Esquema de validação para Transações
export const TransactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().positive("O valor deve ser positivo"),
  date: z.string().or(z.date()),
  type: z.enum(['INCOME', 'EXPENSE']),
  status: z.enum(['PAID', 'PENDING']).default('PAID'),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  companyId: z.string(),
  costCenterId: z.string().optional().nullable(),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;

class TransactionService {
  async getAll(companyId: string) {
    return await prisma.transaction.findMany({
      where: { companyId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: TransactionInput) {
    const validated = TransactionSchema.parse(data);
    return await prisma.transaction.create({
      data: {
        ...validated,
        date: new Date(validated.date),
      },
    });
  }

  async update(id: string, companyId: string, data: Partial<TransactionInput>) {
    // Aqui poderíamos validar o Partial também, mas por brevidade faremos o update direto
    return await prisma.transaction.updateMany({
      where: { id, companyId },
      data: {
        ...data,
        amount: data.amount ? parseFloat(data.amount.toString()) : undefined,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async updateStatus(id: string, companyId: string, status: string, paymentDate?: string) {
    return await prisma.transaction.updateMany({
      where: { id, companyId },
      data: { 
        status: status || 'PAID',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });
  }

  async delete(id: string, companyId: string) {
    return await prisma.transaction.deleteMany({
      where: { id, companyId },
    });
  }

  async clearAll(companyId: string) {
    return await prisma.transaction.deleteMany({
      where: { companyId },
    });
  }
}

export default new TransactionService();
