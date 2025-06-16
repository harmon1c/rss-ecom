'use client';

import { useCart } from '@/components/cart/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsiveToast } from '@/hooks/use-responsive-toast';
import { useCustomerClient } from '@/lib/customer-client';
import { cn } from '@/lib/utils';
import { type ProductProjection } from '@commercetools/platform-sdk';
import { Check, Loader2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
  className?: string;
  formatPrice: (price: number, currencyCode?: string) => string;
  product: ProductProjection;
}

interface LocalizedString {
  [locale: string]: string;
}

function isLocalizedString(value: unknown): value is LocalizedString {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  return Object.values(value).some((val) => typeof val === 'string');
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

// eslint-disable-next-line max-lines-per-function
export default function ProductCard({ className, formatPrice, product }: ProductCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { customerClient } = useCustomerClient();
  const { refreshCart } = useCart();
  const { toast } = useResponsiveToast();

  const { prices = [] } = product.masterVariant;

  let hasDiscount = false;
  let originalPrice = 0;
  let discountedPrice = 0;
  let currencyCode = 'USD';

  if (prices.length > 0) {
    const mainPrice = prices[0];

    if (mainPrice?.value?.centAmount) {
      originalPrice = mainPrice.value.centAmount;
    }

    if (mainPrice?.value?.currencyCode) {
      currencyCode = mainPrice.value.currencyCode;
    }

    if (mainPrice?.discounted?.value?.centAmount) {
      hasDiscount = true;
      discountedPrice = mainPrice.discounted.value.centAmount;
    }
  }

  if (originalPrice === 0 && product.masterVariant.price) {
    const { price } = product.masterVariant;

    if ('value' in price && price.value && 'centAmount' in price.value) {
      originalPrice = price.value.centAmount;
    }

    if ('value' in price && price.value && 'currencyCode' in price.value) {
      currencyCode = price.value.currencyCode;
    }

    if (
      'discounted' in price &&
      price.discounted &&
      'value' in price.discounted &&
      price.discounted.value &&
      'centAmount' in price.discounted.value
    ) {
      hasDiscount = true;
      discountedPrice = price.discounted.value.centAmount;
    }
  }

  let pageCount = '';
  const pageCountAttr = product.masterVariant.attributes?.find((attr) => attr.name === 'pageCount');

  if (pageCountAttr?.value) {
    if (typeof pageCountAttr.value === 'string') {
      pageCount = pageCountAttr.value;
    } else if (isLocalizedString(pageCountAttr.value)) {
      pageCount = getLocalizedText(pageCountAttr.value, '');
    } else {
      pageCount = String(pageCountAttr.value);
    }
  }

  const handleAddToCartAsync = async (): Promise<void> => {
    if (!customerClient) {
      return;
    }

    setIsAddingToCart(true);
    setIsHovered(false);

    try {
      const result = await customerClient.addToCart(product.id, 1, 1);

      if (result) {
        setIsAddedToCart(true);
        await refreshCart();

        toast({
          description: `${getLocalizedText(product.name, 'Untitled Book')} has been added to your cart.`,
          duration: 3000,
          title: 'Added to cart',
        });

        setTimeout(() => {
          setIsAddedToCart(false);
        }, 2500);
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
      setIsAddedToCart(false);
    } finally {
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
    }
  };

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    setIsHovered(false);

    if (isAddingToCart || isAddedToCart || !customerClient) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleAddToCartAsync();
  };

  const getBuyButtonClass = (): string => {
    if (isHovered) {
      return 'bg-amber-600 hover:bg-amber-700 shadow-md';
    }
    if (isAddedToCart) {
      return 'bg-green-600 hover:bg-green-700';
    }
    return 'bg-primary hover:bg-primary/90';
  };

  const getButtonContent = (): JSX.Element => {
    if (isAddingToCart) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Adding...
        </>
      );
    }

    if (isAddedToCart) {
      return (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added
        </>
      );
    }

    return (
      <>
        <ShoppingCart className="h-4 w-4 mr-2" />
        Buy
      </>
    );
  };

  return (
    <div className="block h-full">
      <Card
        className={cn(
          'overflow-hidden flex flex-col h-full transition-all duration-300',
          isHovered ? 'shadow-xl transform scale-[1.02]' : 'shadow-md hover:shadow-lg',
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[3/4] relative bg-muted overflow-hidden">
          <Link href={`/products/${product.id}`}>
            {product.masterVariant.images && product.masterVariant.images.length > 0 ? (
              <Image
                alt={getLocalizedText(product.name, '')}
                className={`object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
                fill
                src={product.masterVariant.images[0].url}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}

            {/* Sale badge */}
            {hasDiscount && (
              <div
                className={`absolute top-2 right-2 bg-destructive text-white px-3 py-1 rounded-md 
                            text-xs font-semibold transition-transform duration-300 ${
                              isHovered ? 'scale-110' : 'scale-100'
                            }`}
              >
                Sale
              </div>
            )}
          </Link>
        </div>

        <CardHeader className={`p-4 flex-grow transition-colors duration-300 ${isHovered ? 'bg-secondary/20' : ''}`}>
          <Link href={`/products/${product.id}`}>
            <CardTitle className="text-lg h-12 line-clamp-2 mb-2">
              {getLocalizedText(product.name, 'Untitled Book')}
            </CardTitle>

            {/* Add author information */}
            {((): JSX.Element | null => {
              const authorAttr = product.masterVariant.attributes?.find((attr) => attr.name === 'author');
              if (!authorAttr?.value) {
                return null;
              }

              let authorText = '';
              if (typeof authorAttr.value === 'string') {
                authorText = authorAttr.value;
              } else if (isLocalizedString(authorAttr.value)) {
                authorText = getLocalizedText(authorAttr.value, '');
              } else {
                authorText = String(authorAttr.value);
              }

              return <div className="h-9 text-sm text-muted-foreground mb-2">by {authorText}</div>;
            })()}

            <CardDescription className="h-18 line-clamp-3 mb-4">
              {getLocalizedText(product.description, 'No description available')}
            </CardDescription>
          </Link>

          <div className="flex flex-col gap-1 h-16">
            {pageCount && <div className="text-sm text-muted-foreground">Pages: {pageCount}</div>}

            <div className="mt-1">
              {hasDiscount && discountedPrice > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-destructive font-bold text-lg text-shadow-sm">
                    {formatPrice(discountedPrice, currencyCode)}
                  </span>
                  <span className="text-muted-foreground line-through text-sm">
                    {formatPrice(originalPrice, currencyCode)}
                  </span>
                </div>
              )}

              {!hasDiscount && originalPrice > 0 && (
                <div className="font-semibold text-lg">{formatPrice(originalPrice, currencyCode)}</div>
              )}

              {originalPrice <= 0 && <div className="text-muted-foreground">Price on request</div>}
            </div>
          </div>
        </CardHeader>

        <CardFooter className={`p-4 pt-0 mt-auto transition-colors duration-300 ${isHovered ? 'bg-secondary/20' : ''}`}>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link href={`/products/${product.id}`}>
              <Button
                className={`font-medium transition-all duration-300 w-full ${
                  isHovered
                    ? 'bg-amber-800/20 hover:bg-amber-400/30 text-foreground border-amber-500'
                    : 'border-amber-500/70 hover:bg-amber-500/30 hover:border-amber-500 dark:bg-amber-800/50'
                }`}
                variant="outline"
              >
                Details
              </Button>
            </Link>
            <Button
              className={`font-medium transition-transform duration-300 w-full ${getBuyButtonClass()}`}
              disabled={isAddingToCart || isAddedToCart}
              onClick={handleAddToCart}
            >
              {getButtonContent()}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
