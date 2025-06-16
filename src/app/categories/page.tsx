import type { BreadcrumbItemProps } from '@/components/layout/Nav/Breadcrumbs';

import Breadcrumbs from '@/components/layout/Nav/Breadcrumbs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { categories } from '../data/categories';

export default function CategoriesPage(): JSX.Element {
  const breadcrumbItems: BreadcrumbItemProps[] = [{ href: '/categories', isCurrentPage: true, label: 'Categories' }];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-amber-500/80">Book Categories</h1>
        <p className="text-muted-foreground">Explore our book collection by category to find your next great read.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div className="bg-muted/50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow" key={category.id}>
            <h2 className="text-xl font-bold mb-2 dark:text-amber-500/80">{category.name}</h2>
            <p className="text-muted-foreground mb-4">{category.description}</p>
            <Button asChild>
              <Link href={`/categories/${category.slug}`}>Browse {category.name}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
