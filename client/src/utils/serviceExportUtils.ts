import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export const generateServiceReceipt = (os: any, companyName: string) => {
  const doc = new jsPDF();
  const brandColor: [number, number, number] = [79, 70, 229]; // Indigo 600

  // --- 1. CABEÇALHO ---
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(companyName.toUpperCase(), 14, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text('CENTRO AUTOMOTIVO E PRESTAÇÃO DE SERVIÇOS', 14, 32);
  doc.setFontSize(12);
  doc.text(`OS #${os.id.toString().padStart(4, '0')}`, 160, 25);
  doc.setFontSize(10);
  doc.text(`${formatDate(os.createdAt)}`, 160, 32);

  // --- 2. DADOS ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text('DADOS DO CLIENTE', 14, 55);
  doc.line(14, 57, 196, 57);
  doc.setFont("helvetica", "normal");
  doc.text(`NOME: ${os.client.name}`, 14, 65);
  doc.text(`CPF/CNPJ: ${os.client.document || 'N/A'}`, 14, 70);
  doc.text(`CONTATO: ${os.client.phone || 'N/A'}`, 14, 75);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, 60, 76, 20, 2, 2, 'F');
  doc.setFont("helvetica", "bold");
  doc.text('VEÍCULO / REFERÊNCIA', 125, 66);
  doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.text(os.client.observation || 'NÃO INFORMADO', 125, 73);

  // --- 3. ITENS ---
  const tableColumn = ["DESCRIÇÃO", "TIPO", "QTD", "UNIT.", "TOTAL"];
  const tableRows = os.items.map((item: any) => [
    item.description.toUpperCase(),
    item.type === 'PART' ? 'PEÇA' : 'SERV',
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.totalPrice)
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'striped',
    headStyles: { fillColor: brandColor, halign: 'center' },
    styles: { fontSize: 8 },
    columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
  });

  // --- 4. FECHAMENTO (POSIÇÃO DINÂMICA) ---
  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // Garantir que não morda o rodapé
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  const totalParts = os.items.filter((i: any) => i.type === 'PART').reduce((acc: number, i: any) => acc + i.totalPrice, 0);
  const totalServices = os.items.filter((i: any) => i.type === 'SERVICE').reduce((acc: number, i: any) => acc + i.totalPrice, 0);

  // Bloco de Totais
  doc.setFillColor(250, 250, 250);
  doc.rect(130, currentY, 66, 30, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Total Peças:`, 135, currentY + 8);
  doc.text(formatCurrency(totalParts), 190, currentY + 8, { align: 'right' });
  doc.text(`Total Serviços:`, 135, currentY + 15);
  doc.text(formatCurrency(totalServices), 190, currentY + 15, { align: 'right' });
  doc.line(135, currentY + 18, 190, currentY + 18);
  doc.setFontSize(11);
  doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL GERAL:`, 135, currentY + 25);
  doc.text(formatCurrency(os.totalAmount), 190, currentY + 25, { align: 'right' });

  // --- 5. ASSINATURAS (ESPAÇO GARANTIDO) ---
  const signY = currentY + 50;
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200);
  doc.line(14, signY, 90, signY);
  doc.setFontSize(8);
  doc.text('ASSINATURA DO RESPONSÁVEL', 25, signY + 5);

  doc.line(120, signY, 196, signY);
  doc.text('ASSINATURA DO CLIENTE', 140, signY + 5);

  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(`Gerado em ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

  doc.save(`Recibo_OS_${os.id}.pdf`);
};
