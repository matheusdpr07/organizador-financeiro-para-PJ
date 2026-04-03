import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes';
import reportRoutes from './routes/reportRoutes';
import setupRoutes from './routes/setupRoutes';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import proxyRoutes from './routes/proxyRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/proxy', proxyRoutes);

import { errorHandler } from './middlewares/errorMiddleware';
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Finanças PJ API está rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
