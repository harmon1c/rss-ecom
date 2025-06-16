/* eslint-disable no-console */

'use client';

import ProductList from '@/components/layout/ProductList/ProductList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomerClient } from '@/lib/customer-client';
import { type ProductProjection } from '@commercetools/platform-sdk';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SortOption } from '../ProductList/ProductSort';

import { isSortOption } from '../ProductList/ProductSort';

interface ProductSearchWrapperProps {
  categoryId?: string;
  searchQuery?: null | string;
}

const PRODUCTS_PER_PAGE = 6;

// eslint-disable-next-line max-lines-per-function
export default function ProductSearchWrapper({ categoryId, searchQuery }: ProductSearchWrapperProps): JSX.Element {
  const { customerClient } = useCustomerClient();
  const [searchResults, setSearchResults] = useState<ProductProjection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const lastFilterUpdateTimestampRef = useRef<number>(0);
  const prevSearchQueryRef = useRef<null | string | undefined>();
  const prevFilterParamsRef = useRef<string>();
  const prevSortOptionRef = useRef<SortOption>();
  const prevSelectedCategoriesRef = useRef<string>();
  const searchRequestIdRef = useRef(0);
  const lastSuccessfulRequestIdRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSort = localStorage.getItem('productSort');
      const validSort = savedSort && isSortOption(savedSort) ? savedSort : 'default';
      setSortOption(validSort);
    }
  }, []);

  // Main search/fetch function
  useEffect(() => {
    if (!customerClient) {
      return;
    }

    const currentFilterParamsString = JSON.stringify(filterParams);
    const currentSelectedCategoriesString = JSON.stringify(selectedCategories);

    const hasImportantChanges =
      searchQuery !== prevSearchQueryRef.current ||
      currentFilterParamsString !== prevFilterParamsRef.current ||
      sortOption !== prevSortOptionRef.current ||
      currentSelectedCategoriesString !== prevSelectedCategoriesRef.current;

    if (!hasImportantChanges && prevSearchQueryRef.current !== undefined) {
      console.log('PSW: No important search parameters changed, skipping request');
      return;
    }

    prevSearchQueryRef.current = searchQuery;
    prevFilterParamsRef.current = currentFilterParamsString;
    prevSortOptionRef.current = sortOption;
    prevSelectedCategoriesRef.current = currentSelectedCategoriesString;

    const currentRequestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = currentRequestId;

    const fetchProductsData = async (): Promise<void> => {
      if (currentRequestId !== searchRequestIdRef.current) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiParams = {
          ...filterParams,
          categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
          limit: PRODUCTS_PER_PAGE,
          offset: 0,
          sortBy: sortOption !== 'default' ? sortOption : undefined,
        };

        console.log('Fetching products with params:', apiParams);

        let response;

        if (searchQuery && searchQuery.length >= 2) {
          response = await customerClient.searchProducts(searchQuery, apiParams);
        } else if (categoryId) {
          response = await customerClient.getProductsByCategory(categoryId, apiParams);
        } else {
          response = await customerClient.getProducts(apiParams);
        }

        if (currentRequestId !== searchRequestIdRef.current) {
          return;
        }

        lastSuccessfulRequestIdRef.current = currentRequestId;

        setSearchResults(response?.results || []);
        setTotalProducts(response?.total || 0);
      } catch (err) {
        if (currentRequestId === searchRequestIdRef.current) {
          setError(err instanceof Error ? err : new Error('Failed to fetch products'));
          setSearchResults([]);
          setTotalProducts(0);
        }
      } finally {
        if (currentRequestId === searchRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    // eslint-disable-next-line no-void
    void fetchProductsData();
  }, [searchQuery, customerClient, filterParams, sortOption, selectedCategories, categoryId]);

  // pagination
  const loadMoreProducts = useCallback(async () => {
    if (!customerClient || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const currentOffset = searchResults.length;

      if (currentOffset >= totalProducts) {
        setIsLoadingMore(false);
        return;
      }

      const apiParams = {
        ...filterParams,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        limit: PRODUCTS_PER_PAGE,
        offset: currentOffset,
        sortBy: sortOption !== 'default' ? sortOption : undefined,
      };

      console.log('Loading more products with offset:', currentOffset);

      // artificial delay
      await new Promise((resolve) => {
        setTimeout(resolve, 800);
      });

      let response;

      if (searchQuery && searchQuery.length >= 2) {
        response = await customerClient.searchProducts(searchQuery, apiParams);
      } else if (categoryId) {
        response = await customerClient.getProductsByCategory(categoryId, apiParams);
      } else {
        response = await customerClient.getProducts(apiParams);
      }

      if (response && response.results) {
        setSearchResults((prev) => [...prev, ...response.results]);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    searchResults.length,
    customerClient,
    searchQuery,
    filterParams,
    sortOption,
    selectedCategories,
    categoryId,
    totalProducts,
    isLoadingMore,
  ]);

  const handleSortChange = (newSortOption: SortOption): void => {
    console.log('PSW: Sorting changed to:', newSortOption);
    setSortOption(newSortOption);
    if (typeof window !== 'undefined') {
      localStorage.setItem('productSort', newSortOption);
    }
  };

  const handleFilterChange = useCallback(
    (newFiltersFromProductList: Record<string, unknown>): void => {
      console.log('PSW: handleFilterChange received:', newFiltersFromProductList);

      const isEmptyUpdate = Object.keys(newFiltersFromProductList).length === 0;
      const hasRecentUpdate = Date.now() - lastFilterUpdateTimestampRef.current < 500;

      if (isEmptyUpdate && hasRecentUpdate) {
        console.log('PSW: Ignoring empty filter update that arrived too soon after previous update');
        return;
      }

      if (!isEmptyUpdate) {
        lastFilterUpdateTimestampRef.current = Date.now();
      }

      if (Object.prototype.hasOwnProperty.call(newFiltersFromProductList, 'category')) {
        const categoryValue = newFiltersFromProductList.category;
        if (Array.isArray(categoryValue)) {
          const newCats = categoryValue.filter((item) => typeof item === 'string');
          setSelectedCategories((prevCats) =>
            JSON.stringify(prevCats) !== JSON.stringify(newCats) ? newCats : prevCats,
          );
        }
      }

      setFilterParams((currentInternalFilters) => {
        const nextInternalFilters: Record<string, unknown> = {};
        if (
          newFiltersFromProductList.price &&
          Array.isArray(newFiltersFromProductList.price) &&
          newFiltersFromProductList.price.length === 2
        ) {
          const priceArray = newFiltersFromProductList.price;
          if (
            Array.isArray(priceArray) &&
            priceArray.length === 2 &&
            typeof priceArray[0] === 'number' &&
            typeof priceArray[1] === 'number'
          ) {
            nextInternalFilters.priceFrom = priceArray[0] * 100;
            nextInternalFilters.priceTo = priceArray[1] * 100;
          }
        } else if (
          Object.prototype.hasOwnProperty.call(newFiltersFromProductList, 'price') &&
          !newFiltersFromProductList.price
        ) {
          delete nextInternalFilters.priceFrom;
          delete nextInternalFilters.priceTo;
        }

        if (JSON.stringify(currentInternalFilters) === JSON.stringify(nextInternalFilters)) {
          return currentInternalFilters;
        }
        console.log('PSW: nextInternalFilters (price, etc.) to be set by handleFilterChange:', nextInternalFilters);
        return nextInternalFilters;
      });
    },
    [setSelectedCategories, setFilterParams],
  );

  const handleCategoryChange = useCallback(
    (categories: string[]): void => {
      console.log('PSW: handleCategoryChange (dedicated) received:', categories);
      setSelectedCategories((prevCats) =>
        JSON.stringify(prevCats) !== JSON.stringify(categories) ? categories : prevCats,
      );
    },
    [setSelectedCategories],
  );

  if (isLoading && searchRequestIdRef.current > lastSuccessfulRequestIdRef.current) {
    let titleMessage = 'Loading products...';

    if (searchQuery) {
      titleMessage = `Searching for "${searchQuery}"...`;
    } else if (categoryId) {
      titleMessage = 'Loading category products...';
    }

    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">{titleMessage}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton className="h-[400px]" key={i} />
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <ProductList
        categoryId={categoryId}
        customProducts={searchResults}
        onCategoryChange={handleCategoryChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        searchQuery={searchQuery || null}
        selectedCategories={selectedCategories}
        sortOption={sortOption}
      />

      {/* Pagination - "Load More" button */}
      {searchResults.length > 0 && searchResults.length < totalProducts && (
        <div className="mt-8 flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-4">
            Showing {searchResults.length} of {totalProducts} products
          </p>
          <Button
            className="min-w-[200px]"
            disabled={isLoadingMore}
            // eslint-disable-next-line no-void
            onClick={() => void loadMoreProducts()}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more products...
              </>
            ) : (
              'Load More Products'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
