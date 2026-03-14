import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companyId = 'demo-company-id';

  const categories = [
    // VENDAS / ENTRADAS (REVENUE)
    { name: 'Venda de Mercadorias', type: 'INCOME', accountingNature: 'REVENUE' },
    { name: 'Prestação de Serviços', type: 'INCOME', accountingNature: 'REVENUE' },
    { name: 'Recebimento de Cartão', type: 'INCOME', accountingNature: 'REVENUE' },
    { name: 'Outras Receitas', type: 'INCOME', accountingNature: 'REVENUE' },
    { name: 'Rendimentos Financeiros', type: 'INCOME', accountingNature: 'FINANCIAL' },
    
    // COMPRAS / SAÍDAS (CLASSIFICADAS)
    { name: 'Impostos sobre Vendas (DAS/ISS)', type: 'EXPENSE', accountingNature: 'DEDUCTION' },
    { name: 'Compra de Estoque / CMV', type: 'EXPENSE', accountingNature: 'DIRECT_COST' },
    { name: 'Pagamento de Fornecedores', type: 'EXPENSE', accountingNature: 'DIRECT_COST' },
    { name: 'Fretes sobre Vendas', type: 'EXPENSE', accountingNature: 'DIRECT_COST' },
    
    // OPERACIONAIS (FIXAS)
    { name: 'Embalagens', type: 'EXPENSE', accountingNature: 'OPERATING_EXPENSE' },
    { name: 'Aluguel do Ponto', type: 'EXPENSE', accountingNature: 'OPERATING_EXPENSE' },
    { name: 'Energia / Água / Internet', type: 'EXPENSE', accountingNature: 'OPERATING_EXPENSE' },
    { name: 'Folha de Pagamento', type: 'EXPENSE', accountingNature: 'OPERATING_EXPENSE' },
    { name: 'Contabilidade', type: 'EXPENSE', accountingNature: 'OPERATING_EXPENSE' },
    { name: 'Software / Assinaturas', type: 'EXPENSE', accountingNature: 'OPERATING_EXPENSE' },
    { name: 'Marketing e Anúncios', type: 'EXPENSE', accountingNature: 'OPERATING_EXPENSE' },
    
    // FINANCEIRAS
    { name: 'Tarifas Bancárias', type: 'EXPENSE', accountingNature: 'FINANCIAL' },
    { name: 'Juros de Empréstimos', type: 'EXPENSE', accountingNature: 'FINANCIAL' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { 
        id: (await prisma.category.findFirst({ where: { name: cat.name, companyId } }))?.id || 'prof-' + cat.name
      },
      update: { accountingNature: cat.accountingNature, type: cat.type },
      create: { ...cat, companyId }
    });
  }

  console.log('Categorias PROFISSIONAIS sincronizadas com sucesso!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
