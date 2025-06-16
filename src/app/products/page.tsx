import type { BreadcrumbItemProps } from '@/components/layout/Nav/Breadcrumbs';

import Breadcrumbs from '@/components/layout/Nav/Breadcrumbs';
// import CategoryNavigation from '@/components/layout/Nav/CategoryNavigation';
import ProductSearchWrapper from '@/components/layout/Search/ProductSearchWrapper';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

import { categories } from '../data/categories';

type ProductsPageProps = {
  searchParams: {
    categoryId?: string;
    q?: string;
  };
};

export default function ProductsPage({ searchParams }: ProductsPageProps): JSX.Element {
  const { categoryId, q: searchQuery } = searchParams;

  const breadcrumbItems: BreadcrumbItemProps[] = searchQuery
    ? [
        { href: '/products', label: 'Products' },
        { href: `/products?q=${searchQuery}`, isCurrentPage: true, label: `Search: "${searchQuery}"` },
      ]
    : [{ href: '/products', isCurrentPage: true, label: 'Products' }];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-8">
        {searchQuery ? (
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Search results for &quot;{searchQuery}&quot;</h1>
              <p className="text-muted-foreground">Showing books matching your search query.</p>
            </div>
            <Button asChild className="sm:self-start flex items-center gap-1 mt-1" variant="outline">
              <Link href="/products">
                <XCircle className="h-4 w-4" />
                <span>Clear search</span>
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2 dark:text-amber-500/80">Our Books Collection</h1>
            <p className="text-muted-foreground">
              Discover our carefully curated selection of books across all genres.
            </p>
          </>
        )}
      </div>

      {/* Categories as horizontal tabs at the top */}
      <div className="mb-6 overflow-x-auto pb-2 hidden md:block">
        <div className="flex space-x-2 min-w-max">
          <h4 className="text-xl font-bold mb-2 dark:text-amber-500/80">Categories</h4>
          <Button asChild size="sm" variant={!categoryId ? 'secondary' : 'ghost'}>
            <Link href="/products">All Books</Link>
          </Button>
          {categories.map((category) => (
            <Button asChild key={category.id} size="sm" variant={category.id === categoryId ? 'secondary' : 'ghost'}>
              <Link href={`/categories/${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* sidebar navigation 
        <div className="hidden md:block">
          <CategoryNavigation 
            activeCategoryId={categoryId} 
            categories={categories}
          />
        </div> */}

        <div className="col-span-1 md:col-span-3">
          <ProductSearchWrapper categoryId={categoryId} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
