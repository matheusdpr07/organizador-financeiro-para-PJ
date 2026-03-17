import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useCashFlow = (month: number, year: number) => {
  return useQuery({
    queryKey: ['cash-flow', month, year],
    queryFn: async () => {
      const { data } = await api.get('/reports/cash-flow', {
        params: { month, year }
      });
      return data;
    },
  });
};
