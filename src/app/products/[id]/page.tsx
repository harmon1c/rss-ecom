'use client';

import type { BreadcrumbItemProps } from '@/components/layout/Nav/Breadcrumbs';

import { categories } from '@/app/data/categories';
import { useCart } from '@/components/cart/CartContext';
import Breadcrumbs from '@/components/layout/Nav/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { type CarouselApi } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useProduct } from '@/hooks/use-product';
import { useResponsiveToast } from '@/hooks/use-responsive-toast';
import { useCustomerClient } from '@/lib/customer-client';
import { Loader2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LocalizedString {
  [locale: string]: string;
}

const getLocalizedText = (localizedObject: LocalizedString | null | string | undefined, defaultText = ''): string => {
  if (!localizedObject) {
    return defaultText;
  }

  if (typeof localizedObject === 'string') {
    return localizedObject;
  }

  if ('en-US' in localizedObject) {
    return localizedObject['en-US'];
  }

  const keys = Object.keys(localizedObject);
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    if (typeof localizedObject[key] === 'string') {
      return localizedObject[key];
    }
  }

  return defaultText;
};

const getBuyButtonClass = (): string => 'bg-primary hover:bg-primary/90';

const getButtonContent = (isAddingToCart: boolean, isAddedToCart: boolean): JSX.Element => {
  if (isAddingToCart) {
    return (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Adding...
      </>
    );
  }

  if (isAddedToCart) {
    return <span>Remove from cart.</span>;
  }

  return (
    <>
      <ShoppingCart className="h-4 w-4 mr-2" />
      Buy
    </>
  );
};

// eslint-disable-next-line max-lines-per-function
export default function ProductPage({ params }: { params: { id: string } }): JSX.Element {
  const [api, setApi] = useState<CarouselApi>();
  const [, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { customerClient } = useCustomerClient();
  const { cart, refreshCart } = useCart();
  const { toast } = useResponsiveToast();

  const { id } = params;

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    setIsAddedToCart(cart?.lineItems.some((item) => item.productId === id) ?? false);
  }, [api, cart?.lineItems, id]);

  const { data: product, error, isLoading } = useProduct(id);

  const price = product?.masterVariant?.prices?.[0].value?.centAmount
    ? (product.masterVariant.prices[0].value.centAmount / 100).toFixed(2)
    : null;
  const discounted = product?.masterVariant?.prices?.[0].discounted?.value?.centAmount
    ? (product.masterVariant.prices[0].discounted.value.centAmount / 100).toFixed(2)
    : null;

  // check product category for breadcrumbs
  const productCategory = product?.categories?.[0]?.id
    ? categories.find((cat) => cat.id === product.categories[0].id)
    : null;

  const breadcrumbItems: BreadcrumbItemProps[] = [{ href: '/products', label: 'Products' }];

  // product has category?, add it to breadcrumbs
  if (productCategory) {
    breadcrumbItems.push({
      href: `/categories/${productCategory.slug}`,
      label: productCategory.name,
    });
  }

  // breadcrumbs
  if (product) {
    breadcrumbItems.push({
      href: `/products/${id}`,
      isCurrentPage: true,
      label: product.name['en-US'],
    });
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const handleAddToCartAsync = async (): Promise<void> => {
    if (!customerClient) {
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await customerClient.addToCart(product?.id ? product.id : '', 1, 1);

      if (result) {
        setIsAddedToCart(true);
        await refreshCart(); // Update cart data in context

        toast({
          description: `${getLocalizedText(product?.name ? product.name : '', 'Untitled Book')} has been added to your cart.`,
          duration: 3000,
          title: 'Added to cart',
        });
      } else {
        toast({
          description: 'Could not add item to cart. Please try again.',
          title: 'Error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        description: 'Could not add item to cart. Please try again.',
        title: 'Error',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const removeFromCart = async (): Promise<void> => {
    if (!customerClient) {
      return;
    }

    setIsAddingToCart(true);
    try {
      const lineId = cart?.lineItems.find((item) => item.productId === product?.id)?.id;
      const result = await customerClient.removeFromCart(lineId ?? '');

      if (result) {
        setIsAddedToCart(false);
        await refreshCart(); // Update cart data in context

        toast({
          description: `${getLocalizedText(product?.name ? product.name : '', 'Untitled Book')} has been removed from your cart.`,
          duration: 3000,
          title: 'Removed from cart',
        });
      } else {
        toast({
          description: 'Could not remove item from cart. Please try again.',
          title: 'Error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        description: 'Could not remove item from cart. Please try again.',
        title: 'Error',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCartButtonClick = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || !customerClient) {
      return;
    }

    if (isAddedToCart) {
      await removeFromCart();
    } else {
      await handleAddToCartAsync();
    }
  };

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error loading product</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">Sorry, we couldn&apos;t find the product you&apos;re looking for.</p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <div className="container mx-auto pt-6 flex flex-col pb-10">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row">
          <div className="basis-2/5 px-4 md:px-20 shrink-0">
            <Carousel className="w-full" setApi={setApi}>
              <CarouselContent className="-ml-2">
                {product.masterVariant?.images?.map((image) => (
                  <CarouselItem className="pl-2 flex justify-center align-start" key={image.url}>
                    <div className="flex justify-center align-start h-[400px]">
                      <DialogTrigger asChild>
                        <Image
                          alt={product.name['en-US']}
                          className="object-cover cursor-zoom-in"
                          height={400}
                          src={image.url}
                          style={{
                            objectPosition: 'center',
                          }}
                          width={250}
                        />
                      </DialogTrigger>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {count > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>

          <div className="grow-0 flex flex-col justify-start gap-4 mt-6 md:mt-0">
            <h2 className="text-2xl font-bold dark:text-amber-500/80">{product.name['en-US']}</h2>
            <div>
              {product.masterVariant?.attributes?.map((attribute) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                attribute.value['en-US'] ? (
                  <p className="flex items-center gap-2" key={attribute.name}>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                    <span>{attribute.name}</span> <span>{attribute.value['en-US']}</span>
                  </p>
                ) : null,
              )}
            </div>
            <div>{product.description?.['en-US']}</div>
            {price &&
              (discounted ? (
                <div className="flex items-end gap-2">
                  <span className="text-lg bold text-red-500">{discounted} $</span>
                  <span className="text-sm line-through">{price} $</span>
                </div>
              ) : (
                <div>
                  <span className="text-lg bold">{price} $</span>
                </div>
              ))}

            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <Button className={`w-80 ${getBuyButtonClass()}`} disabled={isAddingToCart} onClick={handleCartButtonClick}>
              {getButtonContent(isAddingToCart, isAddedToCart)}
            </Button>
          </div>
        </div>

        <DialogContent className="h-[700px] md:h-[800px] w-[80vw] max-w-[80vw] px-20 rounded-lg">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {product.masterVariant?.images?.map((image) => (
                <CarouselItem className="pl-2 flex justify-center align-start" key={image.url}>
                  <div className="flex justify-center align-start h-[755px]">
                    <Image
                      alt={product.name['en-US']}
                      className="object-cover"
                      height={1200}
                      src={image.url}
                      style={{
                        objectFit: 'contain',
                      }}
                      width={400}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {count > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </DialogContent>
      </div>
    </Dialog>
  );
}
