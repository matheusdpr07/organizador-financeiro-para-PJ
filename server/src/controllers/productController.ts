import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getProducts = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const products = await prisma.product.findMany({ 
      where: { companyId },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, sku, quantity, costPrice, salePrice } = req.body;
  const { companyId } = req;
  if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

  try {
    const product = await prisma.product.create({
      data: { 
        name, 
        sku, 
        quantity: parseFloat(quantity) || 0, 
        costPrice: parseFloat(costPrice) || 0, 
        salePrice: parseFloat(salePrice) || 0, 
        companyId 
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar peça' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, sku, quantity, costPrice, salePrice } = req.body;
  const { companyId } = req;

  try {
    await prisma.product.updateMany({
      where: { id, companyId },
      data: { 
        name, 
        sku, 
        quantity: parseFloat(quantity), 
        costPrice: parseFloat(costPrice), 
        salePrice: parseFloat(salePrice) 
      }
    });
    res.json({ message: 'Peça atualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar peça' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    await prisma.product.deleteMany({ where: { id, companyId } });
    res.json({ message: 'Peça excluída' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir peça' });
  }
};
