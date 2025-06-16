import { useQuery } from '@tanstack/react-query';
import type { ProductProjection } from '@commercetools/platform-sdk';
import { useCustomerClient } from '@/lib/customer-client';

export function useProduct(productId: string) {
  const { customerClient } = useCustomerClient();

  return useQuery<ProductProjection | null>({
    queryKey: ['product', productId],
    queryFn: () => customerClient.getProductById(productId),
    enabled: !!productId,
  });
}
