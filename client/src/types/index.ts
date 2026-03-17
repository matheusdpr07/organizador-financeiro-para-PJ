export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  accountingNature: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING';
  categoryId: string;
  category: Category;
  costCenterId?: string | null;
  paymentDate?: string;
  dueDate?: string;
}

export interface Client {
  id: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  observation?: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'SERVICE' | 'PART';
}

export interface ServiceOrder {
  id: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'PAID' | 'CANCELLED';
  description?: string;
  totalAmount: number;
  clientId: string;
  client: Client;
  items: ServiceItem[];
  createdAt: string;
}
