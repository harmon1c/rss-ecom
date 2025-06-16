'use client';

import type { BreadcrumbItemProps } from '@/components/layout/Nav/Breadcrumbs';

import { categories } from '@/app/data/categories';
import Breadcrumbs from '@/components/layout/Nav/Breadcrumbs';
// import CategoryNavigation from '@/components/layout/Nav/CategoryNavigation';
import ProductList from '@/components/layout/ProductList/ProductList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CategoryPage(): JSX.Element {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const category = categories.find((cat) => cat.slug === slug);

  if (!slug || !category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">Sorry, we couldn&apos;t find the category you&apos;re looking for.</p>
        <Button asChild>
          <Link href="/categories">View All Categories</Link>
        </Button>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItemProps[] = [
    { href: '/categories', label: 'Categories' },
    { href: `/categories/${slug}`, isCurrentPage: true, label: category.name },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-foreground">{category.name} Books</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      <div className="mb-6 overflow-x-auto pb-2 hidden md:block">
        <div className="flex space-x-2 min-w-max">
          <h4 className="text-xl font-bold mb-2 dark:text-foreground">Categories</h4>
          <Button asChild size="sm" variant="ghost">
            <Link href="/products">All Books</Link>
          </Button>
          {categories.map((cat) => (
            <Button asChild key={cat.id} size="sm" variant={cat.id === category.id ? 'secondary' : 'ghost'}>
              <Link href={`/categories/${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* <div className="hidden md:block">
          <CategoryNavigation 
            activeCategoryId={category.id} 
            categories={categories} 
          />
        </div> */}

        <div className="col-span-1 md:col-span-3">
          <ProductList categoryId={category.id} />
        </div>
      </div>
    </div>
  );
}
