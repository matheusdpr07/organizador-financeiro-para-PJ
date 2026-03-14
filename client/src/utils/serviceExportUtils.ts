import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export const generateServiceReceipt = (os: any, companyName: string) => {
  const doc = new jsPDF();

  // Cabeçalho da Oficina
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.setFont("helvetica", "bold");
  doc.text(companyName, 14, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text('Recibo de Prestação de Serviços e Peças', 14, 32);
  doc.text(`Ordem de Serviço: #${os.id}`, 160, 25);
  doc.text(`Data: ${formatDate(os.createdAt)}`, 160, 30);

  // Divisor
  doc.setDrawColor(230);
  doc.line(14, 40, 196, 40);

  // Dados do Cliente
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text('DADOS DO CLIENTE', 14, 50);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${os.client.name}`, 14, 58);
  doc.text(`CPF/CNPJ: ${os.client.document || 'Não informado'}`, 14, 63);
  doc.text(`Telefone: ${os.client.phone || 'Não informado'}`, 14, 68);
  doc.text(`Veículo/Ref: ${os.client.observation || 'Não informado'}`, 14, 73);

  // Descrição do Problema/Serviço
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('RELATO TÉCNICO', 14, 85);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const descLines = doc.splitTextToSize(os.description || 'Nenhuma descrição técnica detalhada.', 180);
  doc.text(descLines, 14, 93);

  // Tabela de Itens
  const tableColumn = ["Descrição do Item", "Tipo", "Qtd", "V. Unit", "Total"];
  const tableRows = os.items.map((item: any) => [
    item.description,
    item.type === 'PART' ? 'Peça' : 'Serviço',
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.totalPrice)
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 110,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Totalizador
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`VALOR TOTAL: ${formatCurrency(os.totalAmount)}`, 140, finalY, { align: 'left' });

  // Rodapé / Assinaturas
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('Este documento comprova a realização dos serviços e entrega das peças acima descritas.', 14, finalY + 30);
  
  doc.line(14, finalY + 55, 90, finalY + 55);
  doc.text('Assinatura do Responsável', 14, finalY + 60);

  doc.line(120, finalY + 55, 196, finalY + 55);
  doc.text('Assinatura do Cliente', 120, finalY + 60);

  doc.save(`Recibo_OS_${os.id}_${os.client.name}.pdf`);
};
