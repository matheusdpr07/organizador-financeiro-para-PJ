import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ServiceOrder } from '../types';

export const useServiceOrders = () => {
  return useQuery<ServiceOrder[]>({
    queryKey: ['service-orders'],
    queryFn: async () => {
      const { data } = await api.get('/services/orders');
      return data;
    },
  });
};

export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder: Partial<ServiceOrder>) => {
      const { data } = await api.post('/services/orders', newOrder);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
  });
};

export const useFinalizeOS = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/services/orders/${id}/finalize`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
    },
  });
};

export const useDeleteServiceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/services/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    },
  });
};
