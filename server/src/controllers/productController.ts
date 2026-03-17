import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import productService from '../services/ProductService';
import { z } from 'zod';

export const getProducts = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const products = await productService.getAll(companyId!);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { companyId } = req;
  try {
    const product = await productService.create({ ...req.body, companyId });
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    const result = await productService.update(id, companyId!, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar produto' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { companyId } = req;
  try {
    await productService.delete(id, companyId!);
    res.json({ message: 'Produto excluído' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
};
