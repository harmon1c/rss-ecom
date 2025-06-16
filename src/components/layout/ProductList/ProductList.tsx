/* eslint-disable no-console */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts, useProductsByCategory } from '@/hooks/use-products';
import { useCustomerClient } from '@/lib/customer-client';
import { type ProductProjection } from '@commercetools/platform-sdk';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { FilterGroup, FilterState } from './ProductFilters';

import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductSort, { type SortOption, isSortOption } from './ProductSort';

// ==================== TYPES ====================
type ProductListProps = {
  categoryId?: string;
  customProducts?: ProductProjection[];
  onCategoryChange?: (categories: string[]) => void;
  onFilterChange?: (params: Record<string, unknown>) => void;
  onSortChange?: (option: SortOption) => void;
  searchQuery?: null | string;
  selectedCategories?: string[];
  sortOption?: SortOption;
};

interface LocalizedString {
  [key: string]: string;
  'en-US': string;
}

/**
 * Is the value a LocalizedString?
 * @param value - The value to check
 * @returns true if the value is a LocalizedString, false otherwise
 */
function isLocalizedString(value: unknown): value is LocalizedString {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'en-US' in value && typeof Object.getOwnPropertyDescriptor(value, 'en-US')?.value === 'string';
}

// eslint-disable-next-line max-lines-per-function
export default function ProductList({
  categoryId,
  customProducts,
  onCategoryChange,
  onFilterChange,
  onSortChange,
  searchQuery,
  selectedCategories = [],
  sortOption: externalSortOption,
}: ProductListProps): JSX.Element {
  // ==================== Init clients and states ====================
  const { customerClient } = useCustomerClient();
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});

  const [filters, setFilters] = useState<FilterState>({});
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [persistentFilters, setPersistentFilters] = useState<FilterState>({});
  const [allLoadedProducts, setAllLoadedProducts] = useState<ProductProjection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductProjection[]>([]);
  const [isUsingLocalFilter, setIsUsingLocalFilter] = useState(false);
  const clearingFiltersRef = useRef<boolean>(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved sorting
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    if (externalSortOption) {
      return externalSortOption;
    }

    if (typeof window !== 'undefined') {
      const savedSort = localStorage.getItem('productSort');
      return savedSort && isSortOption(savedSort) ? savedSort : 'default';
    }
    return 'default';
  });
  // ==================== Products data fetching ====================
  const allProductsResult = useProducts(filterParams);
  const categoryProductsResult = useProductsByCategory(categoryId, filterParams);

  const usingCustomProducts = Boolean(customProducts && customProducts.length > 0);
  const usingCategoryProducts = Boolean(categoryId && !usingCustomProducts);

  const { error: errorAll, isLoading: isLoadingAll, products: productsAll } = allProductsResult;
  const { error: errorCategory, isLoading: isLoadingCategory, products: productsCategory } = categoryProductsResult;

  const [products, error, isLoading] = useMemo(() => {
    if (usingCustomProducts) {
      return [customProducts || [], null, false];
    }
    if (usingCategoryProducts) {
      return [productsCategory || [], errorCategory, isLoadingCategory];
    }
    return [productsAll || [], errorAll, isLoadingAll];
  }, [
    usingCustomProducts,
    customProducts,
    usingCategoryProducts,
    productsCategory,
    errorCategory,
    isLoadingCategory,
    productsAll,
    errorAll,
    isLoadingAll,
  ]);

  const displayProducts = useMemo(
    () => (isUsingLocalFilter ? filteredProducts : products || []),
    [isUsingLocalFilter, filteredProducts, products],
  );

  // ==================== Filter init ====================
  // base filter groups
  useEffect(
    () =>
      setFilterGroups([
        {
          id: 'price',
          name: 'Price',
          priceRange: { max: 30, min: 7 },
          type: 'price',
        },
        {
          id: 'category',
          name: 'Category',
          options: [
            { count: 0, id: 'e3e4f0a1-4ec4-46d4-9218-d31df53f3b0e', name: 'Fiction' },
            { count: 0, id: '0d53f9b8-3d55-4d3c-aece-b781c4bbf81e', name: 'Non-Fiction' },
            { count: 0, id: '155ada66-7950-4ff6-a547-bea629d8ad1f', name: 'Fantasy' },
            { count: 0, id: '5212fc6d-a094-47da-af6b-a155e62a44ab', name: 'Mystery' },
            { count: 0, id: '7f72c280-cb7f-428c-acd5-4b7973cee7b5', name: 'Science Fiction' },
            { count: 0, id: 'f40a78a6-97f9-4998-aa9c-fbcac85a29a8', name: 'Romance' },
            { count: 0, id: 'f66f3e8a-050a-4eca-9d0e-4c8d6eca8b3d', name: 'Young Adult' },
            { count: 0, id: 'c93e9929-c9fb-4520-9a4a-5a0d8f59c2c3', name: 'Biography' },
          ],
          type: 'checkbox',
        },
        {
          id: 'author',
          name: 'Author',
          options: [],
          type: 'checkbox',
        },
      ]),
    [],
  );

  useEffect(() => {
    if (customerClient) {
      customerClient.update();
    }
  }, [customerClient]);

  // ==================== Filter results ====================
  /**
   * apply filters to products
   * @param newFilters - The new filter state
   * @returns void
   * @description This function updates the filters state, sets persistent filters, and applies the filters to the products.
   */
  const handleFilterChange = useCallback(
    (newFiltersFromUI: FilterState): void => {
      console.log('ProductList: handleFilterChange received:', { currentInternalFilters: filters, newFiltersFromUI });
      const isReset = Object.keys(newFiltersFromUI).length === 0;

      if (isReset) {
        if (Object.keys(filters).length > 0 || Object.keys(persistentFilters).length > 0) {
          console.log('ProductList: Resetting internal filters.');
          setFilters({});
          setPersistentFilters({});
          setFilterParams((prevParams) => ({ sortBy: prevParams.sortBy }));
          setIsUsingLocalFilter(false);
        } else {
          console.log('ProductList: Internal filters already empty.');
        }
        if (onFilterChange) {
          onFilterChange({});
        }
        return;
      }

      const internalFiltersChanged = !compareFilterObjects(newFiltersFromUI, filters);

      if (internalFiltersChanged) {
        console.log('ProductList: Setting new internal filters:', newFiltersFromUI);
        setFilters(newFiltersFromUI);
        setPersistentFilters(newFiltersFromUI);
      } else {
        console.log('ProductList: Internal filters appear unchanged.');
      }

      if (onFilterChange) {
        onFilterChange(newFiltersFromUI);
      }

      const areFiltersEqual = (a: FilterState, b: FilterState): boolean => {
        if (Object.keys(a).length !== Object.keys(b).length) {
          return false;
        }

        return Object.keys(a).every((key) => {
          const aVal = a[key];
          const bVal = b[key];

          if (Array.isArray(aVal) && Array.isArray(bVal)) {
            if (aVal.length !== bVal.length) {
              return false;
            }
            return aVal.every((val, idx) => val === bVal[idx]);
          }

          return aVal === bVal;
        });
      };

      if (areFiltersEqual(newFiltersFromUI, filters)) {
        console.log('Filters unchanged, skipping processing');
        return;
      }

      if (Object.keys(newFiltersFromUI).length === 0) {
        if (Object.keys(filters).length === 0) {
          console.log('Filters already empty, skipping update');
          return;
        }

        console.log('Resetting all filters');
        setFilters({});
        setPersistentFilters({});

        clearingFiltersRef.current = true;

        setTimeout(() => {
          clearingFiltersRef.current = false;
        }, 100);

        if (onFilterChange) {
          onFilterChange({});
        }

        return;
      }
      console.log('Setting new filters:', newFiltersFromUI);
      setFilters(newFiltersFromUI);
      setPersistentFilters(newFiltersFromUI);

      if (onFilterChange) {
        onFilterChange(newFiltersFromUI);
      }

      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
      filterTimeoutRef.current = setTimeout(() => {
        const authorFilter = newFiltersFromUI.author;
        const hasAuthorFilter = authorFilter !== undefined && Array.isArray(authorFilter) && authorFilter.length > 0;

        if (hasAuthorFilter && allLoadedProducts.length > 0) {
          const apiParams: Record<string, unknown> = {
            sortBy: filterParams.sortBy,
          };

          Object.entries(newFiltersFromUI).forEach(([key, value]) => {
            if (key !== 'author') {
              if (key === 'price' && Array.isArray(value)) {
                if (value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
                  apiParams.priceFrom = value[0] * 100;
                  apiParams.priceTo = value[1] * 100;
                }
              } else if (key === 'category' && Array.isArray(value) && value.length > 0) {
                apiParams.categoryIds = value;
                apiParams.categoryOperator = 'or';
              }
            }
          });

          const authorGroup = filterGroups.find((group) => group.id === 'author');
          let authorNames: string[] = [];

          if (authorGroup?.options) {
            const authorIds = Array.isArray(newFiltersFromUI.author) ? newFiltersFromUI.author : [];
            authorNames = authorIds
              .map((authorId) => {
                const option = authorGroup.options?.find((opt) => opt.id === authorId);
                return option ? option.name : '';
              })
              .filter(Boolean);

            console.log('Looking for authors:', authorNames);
          }

          const locallyFilteredProducts = allLoadedProducts.filter((product) => {
            const authorAttr = product.masterVariant.attributes?.find((attr) => attr.name === 'author');
            if (!authorAttr || !authorAttr.value) {
              return false;
            }

            if (!isLocalizedString(authorAttr.value)) {
              return false;
            }

            const authorValue = authorAttr.value['en-US'];

            return authorNames.some((name) => authorValue.includes(name));
          });

          setFilteredProducts(locallyFilteredProducts);
          setIsUsingLocalFilter(true);

          setFilterParams(apiParams);
        } else {
          const apiParams: Record<string, unknown> = {
            sortBy: filterParams.sortBy,
          };

          Object.entries(newFiltersFromUI).forEach(([key, value]) => {
            if (key === 'price' && Array.isArray(value)) {
              if (value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
                apiParams.priceFrom = value[0] * 100;
                apiParams.priceTo = value[1] * 100;
              }
            } else if (key === 'category' && Array.isArray(value) && value.length > 0) {
              apiParams.categoryIds = value;
              apiParams.categoryOperator = 'or';
            }
          });

          setIsUsingLocalFilter(false);
          setFilterParams(apiParams);
        }
      }, 500);
    },
    [onFilterChange, allLoadedProducts, filterParams.sortBy, filterGroups, filters, persistentFilters],
  );

  // ==================== data refresh effects ====================
  // refresh products when filterParams change
  useEffect(() => {
    if (products && products.length > 0) {
      setAllLoadedProducts(products);
    }
  }, [products]);

  // products and filterGroups
  useEffect(() => {
    if (products && products.length > 0) {
      const authors = new Map<string, number>();
      const categoryOccurrences = new Map<string, number>();

      products.forEach((product) => {
        const authorAttr = product.masterVariant.attributes?.find((attr) => attr.name === 'author');
        if (authorAttr && authorAttr.value) {
          if (isLocalizedString(authorAttr.value)) {
            const authorValue = authorAttr.value['en-US'];
            authors.set(authorValue, (authors.get(authorValue) || 0) + 1);
          }
        }

        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach((category) => {
            if (category.typeId === 'category') {
              const categoryId = category.id;
              categoryOccurrences.set(categoryId, (categoryOccurrences.get(categoryId) || 0) + 1);
            }
          });
        }
      });

      setFilterGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) => {
          if (group.id === 'price') {
            return group;
          }

          if (group.id === 'author') {
            return {
              ...group,
              options: Array.from(authors.entries())
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, count]) => count > 0)
                .map(([author, count]) => ({
                  count,
                  id: author.toLowerCase().replace(/\s+/g, '-'),
                  name: author,
                })),
            };
          }

          if (group.id === 'category') {
            return {
              ...group,
              options: group.options?.map((option) => ({
                ...option,
                count: categoryOccurrences.get(option.id) || 0,
              })),
            };
          }

          return group;
        });

        return updatedGroups;
      });
    }
  }, [products]);

  // categories
  useEffect(() => {
    if (!selectedCategories || selectedCategories.length === 0) {
      return;
    }

    setFilters((currentFilters) => {
      const currentCategoryFilters = currentFilters.category || [];

      if (
        Array.isArray(currentCategoryFilters) &&
        currentCategoryFilters.every((item) => typeof item === 'string') &&
        areArraysEqual(currentCategoryFilters, selectedCategories)
      ) {
        console.log('Categories unchanged, skipping update');
        return currentFilters;
      }

      console.log('Updating filters with selected categories:', selectedCategories);

      return {
        ...currentFilters,
        category: selectedCategories,
      };
    });
  }, [selectedCategories]);

  function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i += 1) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  const handleCategoryChange = useCallback(
    (categories: string[]): void => {
      console.log('ProductList category filter changed to:', categories);

      setFilters((currentFilters) => ({
        ...currentFilters,
        category: categories.length > 0 ? categories : undefined,
      }));

      if (onCategoryChange) {
        onCategoryChange(categories);
      }
    },
    [onCategoryChange],
  );

  // compare and restore filters
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('Checking filters vs persistentFilters:', { filters, persistentFilters });

      if (Object.keys(persistentFilters).length > 0) {
        const filtersEqual = compareFilterObjects(filters, persistentFilters);

        if (!filtersEqual) {
          console.log('restore filters: they are not equal to current filters');
          setFilters(persistentFilters);

          const apiParams: Record<string, unknown> = {};
          Object.entries(persistentFilters).forEach(([key, value]) => {
            if (key === 'price' && Array.isArray(value) && value.length === 2) {
              if (typeof value[0] === 'number' && typeof value[1] === 'number') {
                apiParams.priceFrom = value[0] * 100;
                apiParams.priceTo = value[1] * 100;
              }
            } else if (key === 'category' && Array.isArray(value) && value.length > 0) {
              const allStrings = value.every((item) => typeof item === 'string');
              if (allStrings) {
                apiParams.categoryIds = value;
                apiParams.categoryOperator = 'or';
              }
            } else if (key === 'author' && Array.isArray(value) && value.length > 0) {
              const allStrings = value.every((item) => typeof item === 'string');
              if (allStrings) {
                apiParams.authors = value;
              }
            }
          });

          console.log('restore filterParams:', apiParams);
          apiParams.sortBy = filterParams.sortBy;
          setFilterParams(apiParams);
        }
      }
    }
  }, [products, filters, persistentFilters, filterParams.sortBy]);

  function compareFilterObjects(obj1: FilterState, obj2: FilterState): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    return keys1.every((key) => {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) {
          return false;
        }

        return val1.every((element, index) => element === val2[index]);
      }

      return val1 === val2;
    });
  }
  // ==================== events ====================
  // sorting
  const handleSortChange = useCallback(
    (newSortOption: SortOption): void => {
      console.log('ProductList sorting changed to:', newSortOption);
      setSortOption(newSortOption);

      if (typeof window !== 'undefined') {
        localStorage.setItem('productSort', newSortOption);
      }

      setFilterParams((prevParams) => ({
        ...prevParams,
        sortBy: newSortOption,
      }));

      if (onSortChange) {
        onSortChange(newSortOption);
      }
    },
    [onSortChange],
  );

  // format price
  const formatPrice = (price: number, currencyCode = 'USD'): string =>
    new Intl.NumberFormat('en-US', {
      currency: currencyCode,
      style: 'currency',
    }).format(price / 100);
  // ==================== rendering ====================
  // loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-4 flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {((): string => {
                if (searchQuery) {
                  return `Searching for "${searchQuery}"...`;
                }
                if (categoryId) {
                  return 'Loading Category Products...';
                }
                return 'Loading Products...';
              })()}
            </h2>
            {searchQuery && (
              <p className="text-muted-foreground mb-2">
                {/* Found {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'} */}
              </p>
            )}
          </div>
          <ProductSort onSortChange={handleSortChange} selectedSort={sortOption} />
        </div>
        <ProductFilters
          className="sticky top-24"
          filterGroups={filterGroups}
          onCategoryChange={handleCategoryChange}
          onFilterChange={handleFilterChange}
        />

        <div className="col-span-1 md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Card className="overflow-hidden" key={index}>
                  <div className="aspect-[3/4] relative bg-muted">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                    <Skeleton className="h-5 w-1/3" />
                    <div className="flex gap-2 w-full">
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </div>
    );
  }
  // error state
  if ((searchQuery && customProducts && customProducts.length === 0) || error || !products || products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-4 flex justify-between items-center mb-4">
          <div>
            {((): string => {
              if (searchQuery) {
                return `No results for "${searchQuery}"`;
              }
              if (categoryId) {
                return 'Category Products';
              }
              return 'All Products';
            })()}
          </div>
          <ProductSort onSortChange={handleSortChange} selectedSort={sortOption} />
        </div>
        <div className="hidden md:block">
          <ProductFilters filterGroups={filterGroups} onFilterChange={handleFilterChange} />
        </div>

        <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error && `Error loading products: ${error.message}`}
            {!(error instanceof Error) && searchQuery && `We couldn't find any products matching "${searchQuery}".`}
            {!(error instanceof Error) && !searchQuery && "We couldn't find any products with the selected filters."}
          </p>
          <Button asChild>
            <Link href="/products">Browse all products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // normal loading
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="col-span-1 md:col-span-4 flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-foreground">
            {categoryId ? 'Category Products' : 'All Products'}
          </h2>
        </div>
        <ProductSort onSortChange={handleSortChange} selectedSort={sortOption} />
      </div>
      <ProductFilters className="sticky top-24" filterGroups={filterGroups} onFilterChange={handleFilterChange} />

      <div className="col-span-1 md:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product: ProductProjection) => (
            <ProductCard formatPrice={formatPrice} key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
