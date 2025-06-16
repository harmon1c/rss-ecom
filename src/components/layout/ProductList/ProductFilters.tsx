/* eslint-disable no-console */

'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface FilterOption {
  count?: number;
  id: string;
  name: string;
}

export interface PriceRange {
  max: number;
  min: number;
}

export interface FilterGroup {
  id: string;
  name: string;
  options?: FilterOption[];
  priceRange?: PriceRange;
  type: 'checkbox' | 'price' | 'radio';
}

export interface FilterState {
  [key: string]: [number, number] | string[] | undefined;
}

interface ProductFiltersProps {
  className?: string;
  filterGroups: FilterGroup[];
  initialFilters?: FilterState;
  onCategoryChange?: (categories: string[]) => void;
  onFilterChange: (filters: FilterState) => void;
}

const FILTERS_STORAGE_KEY = 'book-filters';
const PRICE_STORAGE_KEY = 'book-filter-prices';

// eslint-disable-next-line max-lines-per-function
export default function ProductFilters({
  className = '',
  filterGroups,
  initialFilters = {},
  onFilterChange,
}: ProductFiltersProps): JSX.Element {
  const [filters, setFilters] = useState<FilterState>({});
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [localPrices, setLocalPrices] = useState<[number, number] | null>(null);
  const [hasUnappliedPriceChanges, setHasUnappliedPriceChanges] = useState<boolean>(false);
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const isInitialFilterMount = useRef(true);
  const preventFilterEmit = useRef(false);
  const isHandlingExternalUpdate = useRef(false);

  useEffect(() => {
    if (isInitialFilterMount.current) {
      isInitialFilterMount.current = false;
      return;
    }

    if (preventFilterEmit.current) {
      preventFilterEmit.current = false;
      return;
    }

    if (onFilterChange) {
      console.log('call onFilterChange with:', filters);
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  useEffect(() => {
    if (filterGroups.length > 0) {
      setOpenAccordions(filterGroups.map((group) => group.id));
    }
  }, [filterGroups]);

  useEffect(() => {
    if (onFilterChange && !isHandlingExternalUpdate.current) {
      console.log('call onFilterChange with:', filters);
      onFilterChange(filters);
    }
    isHandlingExternalUpdate.current = false;
  }, [filters, onFilterChange]);

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      isHandlingExternalUpdate.current = true;
      // Update your local filters from initialFilters
      setFilters((prev) => {
        // Only update if different
        if (JSON.stringify(prev) !== JSON.stringify(initialFilters)) {
          return { ...initialFilters };
        }
        return prev;
      });
    }
  }, [initialFilters]);

  useEffect(() => {
    if (isEditingPrice) {
      return;
    }

    filterGroups.forEach((group) => {
      if (group.type === 'price' && group.priceRange) {
        const filterValue = filters[group.id];

        if (filterValue && Array.isArray(filterValue)) {
          if (filterValue.length === 2 && typeof filterValue[0] === 'number' && typeof filterValue[1] === 'number') {
            const externalPrices: [number, number] = [filterValue[0], filterValue[1]];

            if (!localPrices || localPrices[0] !== externalPrices[0] || localPrices[1] !== externalPrices[1]) {
              setLocalPrices(externalPrices);
            }
          }
        } else if (!localPrices) {
          setLocalPrices([group.priceRange.min, group.priceRange.max]);
        }
      }
    });
  }, [filterGroups, filters, localPrices, isEditingPrice]);

  useEffect(() => {
    preventFilterEmit.current = true;
    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed: unknown = JSON.parse(savedFilters);

        if (parsed && typeof parsed === 'object' && parsed !== null) {
          const safeFilters: FilterState = {};

          Object.entries(parsed).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              if (value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
                safeFilters[key] = [value[0], value[1]];
              } else if (value.every((item) => typeof item === 'string')) {
                safeFilters[key] = value;
              }
            }
          });

          setFilters(safeFilters);
        }
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }

    const savedPrices = localStorage.getItem(PRICE_STORAGE_KEY);
    if (savedPrices) {
      try {
        const parsed: unknown = JSON.parse(savedPrices);

        if (
          Array.isArray(parsed) &&
          parsed.length === 2 &&
          typeof parsed[0] === 'number' &&
          typeof parsed[1] === 'number'
        ) {
          const priceTuple: [number, number] = [parsed[0], parsed[1]];
          setLocalPrices(priceTuple);
        }
      } catch (e) {
        console.error('Failed to parse saved prices', e);
      }
    } else {
      filterGroups.forEach((group) => {
        if (group.type === 'price' && group.priceRange) {
          setLocalPrices([group.priceRange.min, group.priceRange.max]);
        }
      });
    }
  }, [filterGroups]);

  const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean): void => {
    setFilters((prevFilters) => {
      const currentValues: string[] = [];

      if (prevFilters[groupId] && Array.isArray(prevFilters[groupId])) {
        const values = prevFilters[groupId];
        if (values && values.every((item) => typeof item === 'string')) {
          values.forEach((item) => {
            if (typeof item === 'string') {
              currentValues.push(item);
            }
          });
        }
      }

      const newFilters = checked
        ? { ...prevFilters, [groupId]: [...currentValues, optionId] }
        : { ...prevFilters, [groupId]: currentValues.filter((id) => id !== optionId) };

      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      return newFilters;
    });
  };

  const handleRadioChange = (groupId: string, optionId: string): void => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [groupId]: [optionId] };
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      return newFilters;
    });
  };

  const handlePriceChange = (groupId: string, values: [number, number]): void => {
    if (
      Array.isArray(values) &&
      values.length === 2 &&
      !isNaN(values[0]) &&
      !isNaN(values[1]) &&
      values[0] <= values[1]
    ) {
      setLocalPrices(values);
      localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(values));

      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters, [groupId]: values };
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
        return newFilters;
      });

      setHasUnappliedPriceChanges(false);
    }
  };

  const resetFilters = (): void => {
    console.log('reset all filters');

    setFilters({});

    const defaultPrices = filterGroups.find((g) => g.id === 'price')?.priceRange;
    if (defaultPrices) {
      setLocalPrices([defaultPrices.min, defaultPrices.max]);
    } else {
      setLocalPrices([7, 30]);
    }

    localStorage.removeItem(PRICE_STORAGE_KEY);
    localStorage.removeItem(FILTERS_STORAGE_KEY);

    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const removeFilter = (groupId: string, optionId?: string): void => {
    console.log('remove filter:', groupId, optionId);

    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (groupId === 'price') {
        delete newFilters[groupId];

        const defaultPrices = filterGroups.find((g) => g.id === 'price')?.priceRange;
        if (defaultPrices) {
          setLocalPrices([defaultPrices.min, defaultPrices.max]);
        }

        localStorage.removeItem(PRICE_STORAGE_KEY);
      } else if (optionId) {
        const currentValues = newFilters[groupId];
        if (Array.isArray(currentValues)) {
          if (currentValues.every((item) => typeof item === 'string')) {
            const filtered = currentValues.filter((id) => id !== optionId);
            if (filtered.length === 0) {
              delete newFilters[groupId];
            } else {
              newFilters[groupId] = filtered;
            }
          }
        } else {
          delete newFilters[groupId];
        }
      } else {
        delete newFilters[groupId];
      }

      if (Object.keys(newFilters).length > 0) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
      } else {
        localStorage.removeItem(FILTERS_STORAGE_KEY);
      }

      return newFilters;
    });
  };

  const activeFiltersCount = useMemo(
    () =>
      Object.keys(filters).reduce((total, key) => {
        const values = filters[key];
        if (Array.isArray(values)) {
          return total + values.length;
        }
        return total + (values ? 1 : 0);
      }, 0),
    [filters],
  );

  const renderActiveFilters = (): JSX.Element | null => {
    if (activeFiltersCount === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {Object.entries(filters).map(([groupId, values]) => {
          const group = filterGroups.find((g) => g.id === groupId);

          if (!group) {
            return null;
          }

          if (group.type === 'price' && Array.isArray(values)) {
            if (values.length === 2 && typeof values[0] === 'number' && typeof values[1] === 'number') {
              const min = values[0];
              const max = values[1];

              return (
                <Badge className="flex items-center gap-1 px-2 py-1" key={groupId} variant="outline">
                  <span>
                    Price: ${min} - ${max}
                  </span>
                  <Button
                    className="h-4 w-4 p-0 text-muted-foreground"
                    onClick={() => removeFilter(groupId)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              );
            }
            return null;
          }

          if (Array.isArray(values)) {
            const allStrings = values.every((item) => typeof item === 'string');
            if (!allStrings) {
              return null;
            }

            return values.map((optionId) => {
              if (typeof optionId !== 'string') {
                return null;
              }

              const option = group.options?.find((o) => o.id === optionId);
              if (!option) {
                return null;
              }

              return (
                <Badge className="flex items-center gap-1 px-2 py-1" key={`${groupId}-${optionId}`} variant="outline">
                  <span>
                    {group.name}: {option.name}
                  </span>
                  <Button
                    className="h-4 w-4 p-0 text-muted-foreground"
                    onClick={() => removeFilter(groupId, optionId)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              );
            });
          }

          return null;
        })}

        {activeFiltersCount > 0 && (
          <Button className="text-primary" onClick={resetFilters} size="sm" variant="ghost">
            Reset all
          </Button>
        )}
      </div>
    );
  };

  const renderFilterGroup = (group: FilterGroup): JSX.Element | null => {
    switch (group.type) {
      case 'checkbox': {
        return (
          <div className="space-y-2">
            {group.options?.map((option) => {
              const filterValues = filters[group.id];
              const checked =
                Array.isArray(filterValues) &&
                filterValues.every((item) => typeof item === 'string') &&
                filterValues.includes(option.id);

              return (
                <div className="flex items-center space-x-2" key={option.id}>
                  <Checkbox
                    checked={checked}
                    className="dark:[border:2px_solid_hsl(var(--primary))] dark:data-[state=checked]:[border-color:hsl(var(--primary))]"
                    id={`${group.id}-${option.id}`}
                    onCheckedChange={(value) => handleCheckboxChange(group.id, option.id, !!value)}
                  />
                  <Label
                    className="text-sm flex items-center justify-between w-full"
                    htmlFor={`${group.id}-${option.id}`}
                  >
                    <span>{option.name}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      }
      case 'radio': {
        const filterValues = filters[group.id];
        const [firstValue = ''] = Array.isArray(filterValues) && filterValues.length > 0 ? filterValues : [];

        return (
          <div className="space-y-2">
            {group.options?.map((option) => (
              <div className="flex items-center space-x-2" key={option.id}>
                <input
                  checked={firstValue === option.id}
                  className="h-4 w-4 border-border rounded-full"
                  id={`${group.id}-${option.id}`}
                  name={group.id}
                  onChange={() => handleRadioChange(group.id, option.id)}
                  type="radio"
                />
                <Label
                  className="text-sm flex items-center justify-between w-full"
                  htmlFor={`${group.id}-${option.id}`}
                >
                  <span>{option.name}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground">({option.count})</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        );
      }

      case 'price': {
        if (!group.priceRange) {
          return null;
        }

        const { max, min } = group.priceRange;
        let currentMin = min;
        let currentMax = max;

        if (localPrices) {
          [currentMin, currentMax] = localPrices;
        } else {
          const filterValues = filters[group.id];
          if (
            Array.isArray(filterValues) &&
            filterValues.length === 2 &&
            typeof filterValues[0] === 'number' &&
            typeof filterValues[1] === 'number'
          ) {
            [currentMin, currentMax] = filterValues;
          }
        }

        const checkPriceChanges = (newMin: number, newMax: number): boolean => {
          const filterValues = filters[group.id];

          if (
            Array.isArray(filterValues) &&
            filterValues.length === 2 &&
            typeof filterValues[0] === 'number' &&
            typeof filterValues[1] === 'number'
          ) {
            return filterValues[0] !== newMin || filterValues[1] !== newMax;
          }

          return min !== newMin || max !== newMax;
        };

        const applyPriceFilter = (): void => {
          if (localPrices) {
            handlePriceChange(group.id, localPrices);
            setIsEditingPrice(false);
          }
        };

        return (
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Min</label>
                <input
                  className="w-full px-2 py-1 text-sm border border-border rounded"
                  max={currentMax - 1}
                  min={min}
                  onBlur={applyPriceFilter}
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    if (inputValue && !isNaN(Number(inputValue))) {
                      setIsEditingPrice(true);

                      const value = Math.max(min, Math.min(currentMax - 1, parseInt(inputValue, 10)));
                      const newPrices: [number, number] = [value, currentMax];
                      setLocalPrices(newPrices);

                      setHasUnappliedPriceChanges(checkPriceChanges(value, currentMax));
                    }
                  }}
                  type="number"
                  value={currentMin}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Max</label>
                <input
                  className="w-full px-2 py-1 text-sm border border-border rounded"
                  max={max}
                  min={currentMin + 1}
                  onBlur={applyPriceFilter}
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    if (inputValue && !isNaN(Number(inputValue))) {
                      setIsEditingPrice(true);

                      const value = Math.max(currentMin + 1, Math.min(max, parseInt(inputValue, 10)));
                      const newPrices: [number, number] = [currentMin, value];
                      setLocalPrices(newPrices);

                      setHasUnappliedPriceChanges(checkPriceChanges(currentMin, value));
                    }
                  }}
                  type="number"
                  value={currentMax}
                />
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!hasUnappliedPriceChanges}
              onClick={applyPriceFilter}
              size="sm"
              variant="outline"
            >
              {Object.keys(filters).includes('price') ? 'Update price filter' : 'Apply price filter'}
            </Button>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Desktop version
  const desktopFilters = (
    <div className={`hidden md:block ${className}`}>
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-foreground">Filters</h2>
        {activeFiltersCount > 0 && (
          <Button className="text-sm text-primary" onClick={resetFilters} size="sm" variant="ghost">
            Reset all
          </Button>
        )}
      </div>

      {renderActiveFilters()}

      <Accordion
        className="mt-4"
        onValueChange={(values) => {
          setOpenAccordions(values);
        }}
        type="multiple"
        value={openAccordions}
      >
        {filterGroups.map((group) => (
          <AccordionItem key={group.id} value={group.id}>
            <AccordionTrigger className="text-sm font-medium dark:text-foreground">{group.name}</AccordionTrigger>
            <AccordionContent>{renderFilterGroup(group)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  // Mobile version (sheet)
  const mobileFilters = (
    <div className="md:hidden mb-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="flex items-center gap-2" size="sm" variant="outline">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 rounded-full px-1" variant="secondary">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px] sm:w-[400px]" side="left">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-foreground">Filters</h2>
              {activeFiltersCount > 0 && (
                <Button className="text-sm text-primary" onClick={resetFilters} size="sm" variant="ghost">
                  Reset all
                </Button>
              )}
            </div>

            {renderActiveFilters()}

            <Accordion
              className="mt-4 overflow-auto flex-1"
              onValueChange={(values) => {
                setOpenAccordions(values);
              }}
              type="multiple"
              value={openAccordions}
            >
              {filterGroups.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="text-sm font-medium dark:text-amber-300/80">
                    {group.name}
                  </AccordionTrigger>
                  <AccordionContent>{renderFilterGroup(group)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="border-t pt-4 mt-auto">
              <Button
                className="w-full"
                onClick={() => {
                  if (hasUnappliedPriceChanges && localPrices) {
                    filterGroups.forEach((group) => {
                      if (group.type === 'price') {
                        handlePriceChange(group.id, localPrices);
                      }
                    });
                  }
                  document.body.click();
                }}
              >
                Apply filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {activeFiltersCount > 0 && renderActiveFilters()}
    </div>
  );

  return (
    <>
      {mobileFilters}
      {desktopFilters}
    </>
  );
}
