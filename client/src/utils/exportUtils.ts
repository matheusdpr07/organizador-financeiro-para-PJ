import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheetData = data.map(t => ({
    Data: formatDate(t.date),
    Descrição: t.description,
    Categoria: t.category.name,
    Tipo: t.type === 'INCOME' ? 'Venda / Entrada' : 'Compra / Saída',
    Status: t.status === 'PAID' ? 'Pago' : 'Pendente',
    Valor: t.amount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimentações');
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], fileName: string, companyName: string) => {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(18);
  doc.text('Relatório de Movimentações Financeiras', 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Empresa: ${companyName}`, 14, 30);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 35);

  const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Status", "Valor"];
  const tableRows = data.map(t => [
    formatDate(t.date),
    t.description,
    t.category.name,
    t.type === 'INCOME' ? 'Entrada' : 'Saída',
    t.status === 'PAID' ? 'Pago' : 'Pendente',
    formatCurrency(t.amount)
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
    styles: { fontSize: 9 },
  });

  // Totais
  const totalIncome = data.filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = data.filter(t => t.type === 'EXPENSE' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Total Entradas: ${formatCurrency(totalIncome)}`, 14, finalY);
  doc.text(`Total Saídas: ${formatCurrency(totalExpense)}`, 14, finalY + 5);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Saldo Líquido: ${formatCurrency(totalIncome - totalExpense)}`, 14, finalY + 15);

  doc.save(`${fileName}.pdf`);
};
