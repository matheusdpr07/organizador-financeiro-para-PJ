import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const companyId = 'demo-company-id';
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Criar Usuário Demo
  const user = await prisma.user.upsert({
    where: { email: 'contato@financaspj.com' },
    update: { password: hashedPassword },
    create: {
      email: 'contato@financaspj.com',
      name: 'Empresa Demo',
      password: hashedPassword,
    },
  });

  // 2. Criar Empresa Demo
  const company = await prisma.company.upsert({
    where: { id: companyId },
    update: {},
    create: {
      id: companyId,
      name: 'Minha Empresa PJ',
      cnpj: '00.000.000/0001-00',
      userId: user.id,
    },
  });

  // 3. Criar Centros de Custo
  const costCenters = ['Operacional', 'Administrativo', 'Vendas/Mkt'];
  for (const name of costCenters) {
    await prisma.costCenter.upsert({
      where: { id: 'cc-' + name },
      update: {},
      create: { id: 'cc-' + name, name, companyId },
    });
  }

  // 4. Criar Categorias PJ
  const categories = [
    { name: 'Venda de Serviços', type: 'INCOME' },
    { name: 'Impostos (DAS/ISS)', type: 'EXPENSE' },
    { name: 'Aluguel / Coworking', type: 'EXPENSE' },
    { name: 'Pro-labore', type: 'EXPENSE' },
    { name: 'Software / Assinaturas', type: 'EXPENSE' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: 'cat-' + cat.name },
      update: {},
      create: { id: 'cat-' + cat.name, name: cat.name, type: cat.type, companyId },
    });
  }

  console.log('Dados restaurados com sucesso! Usuário: contato@financaspj.com | Senha: 123456');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
