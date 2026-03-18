export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formata o input enquanto o usuário digita (ex: 1000 -> R$ 10,00)
export const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const amount = parseFloat(digits) / 100;
  if (isNaN(amount)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

// Converte a string formatada de volta para número (ex: R$ 10,00 -> 10.00)
export const parseCurrencyInput = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return parseFloat(digits) / 100 || 0;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatIsoDate = (date: string | Date): string => {
  return new Date(date).toISOString().split('T')[0];
};
