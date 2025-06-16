'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export interface ProductSortProps {
  className?: string;
  onSortChange: (option: SortOption) => void;
  selectedSort: SortOption;
}

export function isSortOption(value: string): value is SortOption {
  return ['default', 'name-asc', 'name-desc', 'price-asc', 'price-desc'].includes(value);
}

export default function ProductSort({ className = '', onSortChange, selectedSort }: ProductSortProps): JSX.Element {
  const handleSortChange = (value: string): void => {
    if (isSortOption(value)) {
      onSortChange(value);
    } else {
      console.error(`Invalid sort option: ${value}`);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium">Sort by:</span>
      <Select defaultValue={selectedSort} onValueChange={handleSortChange} value={selectedSort}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sort products" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="default">Relevance</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
