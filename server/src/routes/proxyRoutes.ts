import { Router, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.get('/plate/:plate', async (req: AuthRequest, res: Response) => {
  const { plate } = req.params;
  const cleanPlate = String(plate).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  console.log(`[Proxy] Consultando placa: ${cleanPlate}`);

  try {
    // Usando wdapi que é uma das mais estáveis para planos gratuitos
    const response = await axios.get(`https://wdapi.com.br/api/v1/placa/${cleanPlate}/json`, {
      timeout: 6000
    });

    const d = response.data;

    // Se a API retornar erro ou status de limite
    if (d.status === "error" || d.message === "Token inválido" || !d.marca) {
      console.error("[Proxy] API retornou erro:", d.message || "Placa não encontrada");
      return res.status(404).json({ error: d.message || 'Placa não encontrada nos registros públicos.' });
    }

    // Mapeamento exaustivo para não perder nenhum dado
    const veiculo = {
      marca: d.marca || d.brand || d.Marca || "",
      modelo: d.modelo || d.model || d.Modelo || "",
      ano: d.anoModelo || d.ano || d.year || d.Ano || "",
      cor: d.cor || d.color || d.Cor || "",
      municipio: d.municipio || d.city || "",
      uf: d.uf || d.state || ""
    };

    console.log("[Proxy] Dados encontrados:", veiculo.marca, veiculo.modelo);
    res.json(veiculo);
  } catch (error: any) {
    console.error("[Proxy] Falha na conexão com a API de placas:", error.message);
    res.status(500).json({ error: 'O servidor de placas está temporariamente indisponível. Digite os dados manualmente.' });
  }
});

export default router;
