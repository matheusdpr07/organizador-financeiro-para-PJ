import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-pj-ultra-segura';

export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const RegisterSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome muito curto"),
});

class AuthService {
  async login(data: z.infer<typeof LoginSchema>) {
    const validated = LoginSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: { companies: true }
    });

    if (!user) throw new Error('Credenciais inválidas');

    const passwordMatch = await bcrypt.compare(validated.password, user.password);
    if (!passwordMatch) throw new Error('Credenciais inválidas');

    const companyId = user.companies[0]?.id;
    const token = jwt.sign(
      { userId: user.id, companyId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
      companyId
    };
  }

  async register(data: z.infer<typeof RegisterSchema>) {
    const validated = RegisterSchema.parse(data);
    
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    
    const user = await prisma.user.create({
      data: { 
        email: validated.email, 
        password: hashedPassword, 
        name: validated.name 
      },
    });

    await prisma.company.create({
      data: { 
        name: `Empresa de ${validated.name}`, 
        userId: user.id 
      }
    });

    return { message: 'Usuário criado com sucesso' };
  }
}

export default new AuthService();
