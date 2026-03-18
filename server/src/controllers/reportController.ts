import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import reportService from '../services/ReportService';

export const getDRE = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  const { companyId } = req;

  if (!month || !year || !companyId) {
    return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios' });
  }

  try {
    const data = await reportService.getDRE(companyId!, Number(month), Number(year));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular DRE' });
  }
};

export const getCashFlow = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  const { companyId } = req;

  if (!month || !year || !companyId) {
    return res.status(400).json({ error: 'Parâmetros month e year são obrigatórios' });
  }

  try {
    const data = await reportService.getCashFlow(companyId!, Number(month), Number(year));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular Fluxo de Caixa' });
  }
};
