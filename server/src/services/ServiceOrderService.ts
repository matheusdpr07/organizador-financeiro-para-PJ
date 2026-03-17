import prisma from '../config/prisma';
import { z } from 'zod';

export const ServiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().default(1),
  unitPrice: z.number(),
  type: z.enum(['SERVICE', 'PART']).default('SERVICE'),
});

export const ServiceOrderSchema = z.object({
  clientId: z.string().min(1),
  description: z.string().optional().nullable(),
  items: z.array(ServiceItemSchema),
  companyId: z.string(),
});

class ServiceOrderService {
  async getAll(companyId: string) {
    return await prisma.serviceOrder.findMany({
      where: { companyId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: z.infer<typeof ServiceOrderSchema>) {
    const validated = ServiceOrderSchema.parse(data);
    const totalAmount = validated.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    return await prisma.serviceOrder.create({
      data: {
        clientId: validated.clientId,
        description: validated.description,
        totalAmount,
        companyId: validated.companyId,
        status: 'OPEN',
        items: {
          create: validated.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            type: item.type
          }))
        }
      },
      include: { items: true }
    });
  }

  async finalize(id: number, companyId: string) {
    const os = await prisma.serviceOrder.findFirst({
      where: { id, companyId },
      include: { client: true }
    });

    if (!os) throw new Error('OS não encontrada');

    await prisma.serviceOrder.update({
      where: { id },
      data: { status: 'PAID' }
    });

    // Lançamento automático no financeiro
    const category = await prisma.category.findFirst({
      where: { companyId, accountingNature: 'REVENUE' }
    });

    await prisma.transaction.create({
      data: {
        description: `OS #${os.id} - Cliente: ${os.client.name}`,
        amount: os.totalAmount,
        type: 'INCOME',
        status: 'PAID',
        date: new Date(),
        companyId: companyId,
        categoryId: category?.id || 'default'
      }
    });

    return { message: 'OS finalizada e lançada no financeiro' };
  }

  async delete(id: number, companyId: string) {
    await prisma.serviceItem.deleteMany({ where: { serviceOrderId: id } });
    return await prisma.serviceOrder.deleteMany({ where: { id, companyId } });
  }

  async deleteMany(ids: number[], companyId: string) {
    await prisma.serviceItem.deleteMany({ where: { serviceOrderId: { in: ids } } });
    return await prisma.serviceOrder.deleteMany({ where: { id: { in: ids }, companyId } });
  }
}

export default new ServiceOrderService();
