import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getCategories = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const categories = await prisma.category.findMany({
      where: { companyId }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

export const getCostCenters = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const costCenters = await prisma.costCenter.findMany({
      where: { companyId }
    });
    res.json(costCenters);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar centros de custo' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, type } = req.body;
  const { companyId } = req;
  
  if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

  try {
    const category = await prisma.category.create({
      data: { name, type, companyId }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};
