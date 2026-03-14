import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companyId = 'demo-company-id';

  const categories = [
    // VENDAS / ENTRADAS (INCOME)
    { name: 'Venda de Mercadorias', type: 'INCOME' },
    { name: 'Prestação de Serviços', type: 'INCOME' },
    { name: 'Recebimento de Cartão', type: 'INCOME' },
    { name: 'Outras Receitas', type: 'INCOME' },
    
    // COMPRAS / SAÍDAS (EXPENSE)
    { name: 'Compra de Estoque', type: 'EXPENSE' },
    { name: 'Pagamento de Fornecedores', type: 'EXPENSE' },
    { name: 'Fretes e Logística', type: 'EXPENSE' },
    { name: 'Embalagens', type: 'EXPENSE' },
    { name: 'Aluguel do Ponto', type: 'EXPENSE' },
    { name: 'Energia / Água / Internet', type: 'EXPENSE' },
    { name: 'Folha de Pagamento', type: 'EXPENSE' },
    { name: 'Impostos e Taxas', type: 'EXPENSE' },
    { name: 'Marketing e Anúncios', type: 'EXPENSE' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { 
        id: (await prisma.category.findFirst({ where: { name: cat.name, companyId } }))?.id || 'comm-' + cat.name
      },
      update: { type: cat.type },
      create: { ...cat, companyId }
    });
  }

  console.log('Categorias de COMÉRCIO sincronizadas com sucesso!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
