import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import clientService from '../services/ClientService';
import serviceOrderService from '../services/ServiceOrderService';
import { z } from 'zod';

// CLIENTES
export const getClients = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const clients = await clientService.getAll(companyId!);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const client = await clientService.create({ ...req.body, companyId });
    res.status(201).json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    const result = await clientService.update(id, companyId!, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar cliente' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    await clientService.delete(id, companyId!);
    res.json({ message: 'Cliente excluído' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
};

// ORDENS DE SERVIÇO
export const getServiceOrders = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const orders = await serviceOrderService.getAll(companyId!);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
  }
};

export const createServiceOrder = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const order = await serviceOrderService.create({ ...req.body, companyId });
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar ordem de serviço' });
  }
};

export const finalizeOS = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    const result = await serviceOrderService.finalize(Number(id), companyId!);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao finalizar OS' });
  }
};

export const deleteServiceOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    await serviceOrderService.delete(Number(id), companyId!);
    res.json({ message: 'Ordem de Serviço excluída' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir Ordem de Serviço' });
  }
};

export const deleteManyServiceOrders = async (req: AuthRequest, res: Response) => {
  const { ids } = req.body; 
  const { companyId } = req;
  try {
    await serviceOrderService.deleteMany(ids.map(Number), companyId!);
    res.json({ message: `Foram excluídas ${ids.length} Ordens de Serviço` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir múltiplas Ordens de Serviço' });
  }
};
