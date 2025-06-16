/* eslint-disable no-console */

import { useCustomerClient } from '@/lib/customer-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useProducts(filterParams: Record<string, any> = {}) {
  const { customerClient } = useCustomerClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', filterParams],
    queryFn: async () => {
      try {
        const productsData = await customerClient.getProducts(filterParams);
        return productsData?.results || [];
      } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    products,
    isLoading,
    error,
  };
}

export function useProductsByCategory(categoryId?: string, filterParams: Record<string, any> = {}) {
  const { customerClient } = useCustomerClient();

  useEffect(() => {
    if (customerClient) {
      customerClient.update();
    }
  }, [customerClient]);

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', 'category', categoryId, filterParams],
    queryFn: async () => {
      try {
        if (!customerClient || !categoryId) return [];

        customerClient.update();

        console.log(`Fetching products for category: ${categoryId} with filters:`, filterParams);
        const productsData = await customerClient.getProductsByCategory(categoryId, filterParams);
        console.log(`Got products:`, productsData?.results?.length || 0);
        return productsData?.results || [];
      } catch (err) {
        console.error(`Error fetching products for category ${categoryId}:`, err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!customerClient && !!categoryId,
  });

  return {
    products,
    isLoading,
    error,
  };
}
