import prisma from '../config/prisma';
import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().optional().nullable(),
  quantity: z.number().default(0),
  costPrice: z.number().default(0),
  salePrice: z.number().default(0),
  companyId: z.string(),
});

class ProductService {
  async getAll(companyId: string) {
    return await prisma.product.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });
  }

  async create(data: z.infer<typeof ProductSchema>) {
    const validated = ProductSchema.parse(data);
    return await prisma.product.create({
      data: validated
    });
  }

  async update(id: string, companyId: string, data: Partial<z.infer<typeof ProductSchema>>) {
    return await prisma.product.updateMany({
      where: { id, companyId },
      data
    });
  }

  async delete(id: string, companyId: string) {
    return await prisma.product.deleteMany({
      where: { id, companyId }
    });
  }
}

export default new ProductService();
