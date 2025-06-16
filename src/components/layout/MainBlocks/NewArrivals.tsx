'use client';

import ProductCard from '@/components/layout/ProductList/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import Link from 'next/link';
import { useCallback } from 'react';

interface NewArrivalsSectionProps {
  description?: string;
  limit?: number;
  showViewAllButton?: boolean;
  title?: string;
}

export default function NewArrivalsSection({
  description = 'The latest additions to our growing library of titles.',
  limit = 6,
  showViewAllButton = true,
  title = 'New Arrivals',
}: NewArrivalsSectionProps): JSX.Element {
  const { error, isLoading, products } = useProducts({ limit, sortBy: 'createdAt-desc' });

  const formatPrice = useCallback(
    (price: number, currencyCode = 'USD'): string =>
      new Intl.NumberFormat('en-US', {
        currency: currencyCode,
        style: 'currency',
      }).format(price / 100),
    [],
  );

  const renderSkeletonItems = (): JSX.Element[] =>
    Array(limit)
      .fill(0)
      .map((_, index) => (
        <CarouselItem className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4" key={`skeleton-${index}`}>
          <div className="h-full">
            <div className="aspect-[3/4] bg-muted w-full">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CarouselItem>
      ));

  const renderErrorMessage = (): JSX.Element => (
    <CarouselItem className="pl-2 md:pl-4 basis-full">
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load new arrivals. Please try again later.</p>
      </div>
    </CarouselItem>
  );

  const renderProductItems = (): JSX.Element[] =>
    products!.slice(0, limit).map((product) => (
      <CarouselItem className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4" key={product.id}>
        <ProductCard formatPrice={formatPrice} product={product} />
      </CarouselItem>
    ));

  const renderPlaceholderItems = (): JSX.Element[] =>
    Array(limit)
      .fill(0)
      .map((_, index) => (
        <CarouselItem className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4" key={`placeholder-${index}`}>
          <Card className="overflow-hidden flex flex-col h-full">
            <div className="aspect-[3/4] bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Coming Soon</p>
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-base">New Book Coming Soon</CardTitle>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full" disabled size="sm" variant="outline">
                <Link href="#">View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        </CarouselItem>
      ));

  const renderCarouselContent = (): JSX.Element | JSX.Element[] => {
    if (isLoading) {
      return renderSkeletonItems();
    }

    if (error) {
      return renderErrorMessage();
    }

    if (products && products.length > 0) {
      return renderProductItems();
    }

    return renderPlaceholderItems();
  };

  return (
    <section className="w-full py-8 md:py-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter dark:text-foreground">{title}</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-8 relative pb-10 md:pb-0">
          <Carousel
            className="w-full max-w-5xl mx-auto"
            opts={{
              align: 'start',
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">{renderCarouselContent()}</CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="-left-12 border-amber-500 text-amber-500 hover:bg-amber-100 hover:text-amber-600" />
              <CarouselNext className="-right-12 border-amber-500 text-amber-500 hover:bg-amber-100 hover:text-amber-600" />
            </div>

            <div className="mt-4 flex justify-center gap-2 sm:hidden sm:bottom-4 absolute md:bottom-0 left-0 right-0">
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

        {showViewAllButton && (
          <div className="flex justify-center mt-12">
            <Button
              asChild
              className="font-medium text-black transition-all duration-300 shadow-md bg-primary hover:bg-primary/50"
              variant="outline"
            >
              <Link href="/products">View All Books</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
