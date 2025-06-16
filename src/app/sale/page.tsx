'use client';

import type { BreadcrumbItemProps } from '@/components/layout/Nav/Breadcrumbs';

import Breadcrumbs from '@/components/layout/Nav/Breadcrumbs';
import ProductCard from '@/components/layout/ProductList/ProductCard';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import Link from 'next/link'; // Import the correct Link component
import { Sparkles } from 'lucide-react';
import { useCallback, useMemo } from 'react';

export default function SalePage(): JSX.Element {
  const { error, isLoading, products } = useProducts({ limit: 100 });

  const formatPrice = useCallback(
    (price: number, currencyCode = 'USD'): string =>
      new Intl.NumberFormat('en-US', {
        currency: currencyCode,
        style: 'currency',
      }).format(price / 100),
    [],
  );

  const discountedProducts = useMemo(() => {
    if (!products) {
      return [];
    }
    return products.filter((product) => {
      const { prices = [] } = product.masterVariant;

      if (prices.length > 0) {
        return prices.some((price) => price?.discounted?.value?.centAmount);
      }

      if (
        product.masterVariant.price &&
        'discounted' in product.masterVariant.price &&
        product.masterVariant.price.discounted &&
        'value' in product.masterVariant.price.discounted
      ) {
        return true;
      }

      return false;
    });
  }, [products]);

  const breadcrumbItems: BreadcrumbItemProps[] = [
    { href: '/', label: 'Home' },
    { href: '/sale', isCurrentPage: true, label: 'Sale' },
  ];

  const renderSkeletonItems = (itemsPerView: string): JSX.Element[] =>
    Array(6)
      .fill(0)
      .map(
        (_, index): JSX.Element => (
          <CarouselItem className={`pl-2 md:pl-4 ${itemsPerView}`} key={`skeleton-${index}`}>
            <div className="h-full">
              <div className="aspect-[3/4] bg-muted w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CarouselItem>
        ),
      );

  const renderErrorMessage = (): JSX.Element[] => [
    <CarouselItem className="pl-2 md:pl-4 basis-full" key="error-message">
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load sale items. Please try again later.</p>
      </div>
    </CarouselItem>,
  ];

  const renderProductItems = (itemsPerView: string): JSX.Element[] =>
    discountedProducts.slice(0, 12).map((product) => (
      <CarouselItem className={`pl-2 md:pl-4 ${itemsPerView}`} key={product.id}>
        <ProductCard formatPrice={formatPrice} product={product} />
      </CarouselItem>
    ));

  const renderEmptyState = (): JSX.Element[] => [
    <CarouselItem className="pl-2 md:pl-4 basis-full" key="empty-state">
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sale items available at this time. Please check back later.</p>
      </div>
    </CarouselItem>,
  ];

  const getCarouselContent = (itemsPerView: string): JSX.Element[] => {
    if (isLoading) {
      return renderSkeletonItems(itemsPerView);
    }

    if (error) {
      return renderErrorMessage();
    }

    if (discountedProducts.length > 0) {
      return renderProductItems(itemsPerView);
    }

    return renderEmptyState();
  };

  const renderCarousel = (itemsPerView: string): JSX.Element => (
    <div className="relative mb-16 mt-8">
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">{getCarouselContent(itemsPerView)}</CarouselContent>

        <div className="mt-4 flex justify-center gap-2 sm:bottom-4 absolute md:-bottom-12 left-0 right-0">
          <CarouselPrevious
            className="relative inset-0 translate-y-0 border-amber-500 text-amber-500 hover:bg-amber-100 hover:text-amber-600"
            variant="outline"
          />
          <CarouselNext
            className="relative inset-0 translate-y-0 border-amber-500 text-amber-500 hover:bg-amber-100 hover:text-amber-600"
            variant="outline"
          />
        </div>
      </Carousel>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div
        className={cn(
          'mb-8 relative pb-6 pt-8 px-6 rounded-lg overflow-hidden',
          'bg-gradient-to-r from-amber-600/30 to-amber-500/10 border border-amber-600/30',
        )}
      >
        <div className="absolute inset-0 bg-[url('/img/png/confetti-bg.png')] opacity-10 bg-repeat" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-3xl font-bold dark:text-amber-500/80">Special Offers & Discounts</h1>
            <Sparkles className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Discover our carefully selected collection of discounted books. Limited-time offers on bestsellers, new
            releases, and timeless classics. The perfect opportunity to expand your library for less!
          </p>
        </div>
      </div>

      <div className="md:hidden">{renderCarousel('basis-full')}</div>

      <div className="hidden md:block lg:hidden">{renderCarousel('basis-1/2')}</div>

      <div className="hidden lg:block">{renderCarousel('basis-1/3')}</div>

      <div className="flex justify-center mt-4">
        <Button
          asChild
          className="font-medium text-black transition-all duration-300 shadow-md bg-primary hover:bg-primary/50"
          variant="outline"
        >
          <Link href="/products">View All Books</Link>
        </Button>
      </div>
    </div>
  );
}
