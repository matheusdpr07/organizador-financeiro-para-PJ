import prisma from '../config/prisma';
import { z } from 'zod';

export const ClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  document: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  companyId: z.string(),
});

class ClientService {
  async getAll(companyId: string) {
    return await prisma.client.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });
  }

  async create(data: z.infer<typeof ClientSchema>) {
    const validated = ClientSchema.parse(data);
    return await prisma.client.create({
      data: validated
    });
  }

  async update(id: string, companyId: string, data: Partial<z.infer<typeof ClientSchema>>) {
    return await prisma.client.updateMany({
      where: { id, companyId },
      data
    });
  }

  async delete(id: string, companyId: string) {
    return await prisma.client.deleteMany({
      where: { id, companyId }
    });
  }
}

export default new ClientService();
