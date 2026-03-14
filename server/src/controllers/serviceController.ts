import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// CLIENTES
export const getClients = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const clients = await prisma.client.findMany({ 
      where: { companyId },
      orderBy: { name: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  const { name, document, phone, email, observation, address } = req.body;
  const { companyId } = req;
  if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

  try {
    const client = await prisma.client.create({
      data: { name, document, phone, email, observation, address, companyId }
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, document, phone, email, observation, address } = req.body;
  const { companyId } = req;

  try {
    await prisma.client.updateMany({
      where: { id, companyId },
      data: { name, document, phone, email, observation, address }
    });
    res.json({ message: 'Cliente atualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar cliente' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    await prisma.client.deleteMany({ where: { id, companyId } });
    res.json({ message: 'Cliente excluído' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
};

// ORDENS DE SERVIÇO
export const getServiceOrders = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const orders = await prisma.serviceOrder.findMany({
      where: { companyId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
  }
};

export const createServiceOrder = async (req: AuthRequest, res: Response) => {
  const { clientId, description, items } = req.body;
  const { companyId } = req;
  if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

  try {
    const totalAmount = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);

    const order = await prisma.serviceOrder.create({
      data: {
        clientId,
        description,
        totalAmount,
        companyId,
        status: 'OPEN',
        items: {
          create: items.map((item: any) => ({
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
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar ordem de serviço' });
  }
};

export const finalizeOS = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;

  try {
    const os = await prisma.serviceOrder.findFirst({
      where: { id: Number(id), companyId },
      include: { client: true }
    });

    if (!os) return res.status(404).json({ error: 'OS não encontrada' });

    await prisma.serviceOrder.update({
      where: { id: Number(id) },
      data: { status: 'PAID' }
    });

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
        companyId: companyId!,
        categoryId: category?.id || 'default-cat-id'
      }
    });

    res.json({ message: 'OS finalizada e lançada no financeiro' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao finalizar OS' });
  }
};
