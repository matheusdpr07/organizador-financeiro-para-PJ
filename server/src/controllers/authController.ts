import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'chave-secreta-pj-ultra-segura'; // Fixa para teste inicial

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`Tentativa de login para: ${email}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { companies: true }
    });

    if (!user) {
      console.log('Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Senha confere?', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, companyId: user.companies[0]?.id },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('Login bem-sucedido, token gerado.');

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      companyId: user.companies[0]?.id
    });
  } catch (error) {
    console.error('Erro no servidor durante login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    await prisma.company.create({
      data: { name: `Empresa de ${name || email}`, userId: user.id }
    });
    res.status(201).json({ message: 'Usuário criado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};
