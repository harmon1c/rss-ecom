'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Book, BookOpen, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Category {
  description: string;
  id: string;
  name: string;
  slug: string;
}

interface CategoryNavigationProps {
  activeCategoryId?: string;
  categories: Category[];
  className?: string;
}

export default function CategoryNavigation({
  activeCategoryId,
  categories,
  className,
}: CategoryNavigationProps): JSX.Element {
  const pathname = usePathname();

  const renderIcon = (slug: string): JSX.Element => {
    // Match icons to category types - using available Lucide icons
    switch (slug) {
      case 'fiction':
      case 'non-fiction':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'fantasy':
      case 'sci-fi':
      case 'mystery':
      case 'romance':
        return <Book className="h-4 w-4 mr-2" />;
      case 'biography':
      case 'children':
        return <Library className="h-4 w-4 mr-2" />;
      default:
        return <Book className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <h3 className="font-medium mb-3">Categories</h3>
      <div className="space-y-1">
        <Button
          asChild
          className={cn('w-full justify-start', pathname === '/products' && !activeCategoryId && 'bg-accent')}
          variant="ghost"
        >
          <Link href="/products">
            <Book className="h-4 w-4 mr-2" />
            All Books
          </Link>
        </Button>

        {categories.map((category) => (
          <Button
            asChild
            className={cn('w-full justify-start', category.id === activeCategoryId && 'bg-accent')}
            key={category.id}
            variant="ghost"
          >
            <Link href={`/categories/${category.slug}`}>
              {renderIcon(category.slug)}
              {category.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
