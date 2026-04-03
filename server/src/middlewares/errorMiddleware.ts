import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro detectado:', err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      error: 'Erro de validação', 
      details: (err as any).errors 
    });
  }

  if (err.message === 'Credenciais inválidas') {
    return res.status(401).json({ error: err.message });
  }

  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
