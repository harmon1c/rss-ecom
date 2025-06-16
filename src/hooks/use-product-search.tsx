import { type ProductProjection } from '@commercetools/platform-sdk';
import { useCustomerClient } from '@/lib/customer-client';
import { useCallback, useEffect, useState } from 'react';
import type { SortOption } from '@/components/layout/ProductList/ProductSort';

interface UseProductSearchReturn {
  products: ProductProjection[];
  isLoading: boolean;
  error: Error | null;
  setFilterParams: (params: Record<string, unknown>) => void;
  handleSearch: (query: string) => void;
  handleSortChange: (option: SortOption) => void;
  sortOption: SortOption;
  selectedCategories: string[];
  handleCategoryChange: (categories: string[]) => void;
}

export function useProductSearch(
  categoryId?: string,
  initialCategories?: string[],
  initialSearchQuery?: string | null,
): UseProductSearchReturn {
  const { customerClient } = useCustomerClient();
  const [products, setProducts] = useState<ProductProjection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const [searchQuery, setSearchQuery] = useState<string | null>(
    initialSearchQuery && initialSearchQuery.trim() !== '' ? initialSearchQuery : null,
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories || []);
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    if (typeof window !== 'undefined') {
      const savedSort = localStorage.getItem('productSort');
      return savedSort &&
        (savedSort === 'default' ||
          savedSort === 'name-asc' ||
          savedSort === 'name-desc' ||
          savedSort === 'price-asc' ||
          savedSort === 'price-desc')
        ? (savedSort as SortOption)
        : 'default';
    }
    return 'default';
  });

  useEffect(() => {
    console.log('Search params changed:', {
      searchQuery,
      categoryId,
      sortOption,
      filterParams,
      selectedCategories,
    });
    if (!customerClient) {
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let result;

        const paramsWithSort = {
          ...filterParams,
          sortBy: sortOption !== 'default' ? sortOption : undefined,
          categoryIds: selectedCategories.length > 0 ? selectedCategories : categoryId ? [categoryId] : undefined,
        };

        if (searchQuery) {
          result = await customerClient.searchProducts(searchQuery, paramsWithSort);
        } else if (categoryId) {
          result = await customerClient.getProductsByCategory(categoryId, paramsWithSort);
        } else {
          result = await customerClient.getProducts(paramsWithSort);
        }

        if (result?.results) {
          setProducts(result.results);
        } else {
          setProducts([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err : new Error('Failed to load products'));
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [customerClient, filterParams, categoryId, searchQuery, sortOption, selectedCategories]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query ? query.trim() : null);
  }, []);

  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
  }, []);

  const handleSortChange = useCallback((newSortOption: SortOption): void => {
    console.log('Sorting changed to:', newSortOption);
    setSortOption(newSortOption);

    if (typeof window !== 'undefined') {
      localStorage.setItem('productSort', newSortOption);
    }

    setFilterParams((prevParams) => ({
      ...prevParams,
      sortBy: newSortOption,
    }));
  }, []);

  return {
    products,
    isLoading,
    error,
    setFilterParams,
    handleSearch,
    handleSortChange,
    sortOption,
    selectedCategories,
    handleCategoryChange,
  };
}
