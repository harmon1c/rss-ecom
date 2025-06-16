'use client';

import { useCart } from '@/components/cart/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomerClient } from '@/lib/customer-client';
import { Minus, Plus, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StyledInput } from '../ui/StyledInput';

const formatPrice = (amount: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', {
    currency,
    style: 'currency',
  }).format(amount / 100);

// eslint-disable-next-line max-lines-per-function
export default function CartPageContent(): JSX.Element {
  const { cart, loading, refreshCart } = useCart();
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const { customerClient } = useCustomerClient();
  const [promocode, setPromocode] = useState('');

  useEffect(() => {
    refreshCart().catch(console.error);
  }, [refreshCart]);

  const handleRemoveItem = async (lineItemId: string): Promise<void> => {
    setIsRemoving((prev) => ({ ...prev, [lineItemId]: true }));
    try {
      if (customerClient) {
        await customerClient.removeFromCart(lineItemId);
        await refreshCart();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsRemoving((prev) => ({ ...prev, [lineItemId]: false }));
    }
  };

  const handleQuantityChange = async (lineItemId: string, newQuantity: number): Promise<void> => {
    if (newQuantity < 1) {
      return;
    }

    setIsUpdating((prev) => ({ ...prev, [lineItemId]: true }));
    try {
      if (customerClient) {
        await customerClient.updateCartItemQuantity(lineItemId, newQuantity);
        await refreshCart();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [lineItemId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-amber-500/80">Your Cart</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div className="flex gap-4" key={i}>
              <Skeleton className="h-32 w-24" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-6 dark:text-amber-500/80">Your Cart is Empty</h1>
        <p className="mb-6 text-muted-foreground">Start shopping to add items to your cart.</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cart.lineItems.reduce((sum, item) => {
    const price = item.price.discounted ? item.price.discounted.value.centAmount : item.price.value.centAmount;
    return sum + price * item.quantity;
  }, 0);

  async function handleActivateCode(code: string): Promise<void> {
    try {
      await customerClient.applyDiscountCode(code);
      await refreshCart();
    } catch (error) {
      console.error(error);
    }
  }

  const handleClearCartClick = async (): Promise<void> => {
    try {
      if (customerClient) {
        await customerClient.clearCart();
        await refreshCart();
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-6 dark:text-amber-500/80">Your Cart</h1>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <Button onClick={() => handleClearCartClick()}>Clear Cart</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 col-span-1">
          <CardHeader>
            <CardTitle>Promo code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <StyledInput
                className="flex-1 md:w-2/3 mr-2"
                onChange={(e) => setPromocode(e.target.value)}
                placeholder="Enter promo code"
                value={promocode}
              />
              {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
              <Button onClick={() => handleActivateCode(promocode)}>Activate code</Button>
            </div>
          </CardContent>
        </Card>
        <div className="md:col-span-2 space-y-4">
          {cart.lineItems.map((item) => {
            const productName = item.name['en-US'] || 'Untitled Product';
            const price = item.price.discounted ? item.price.discounted.value.centAmount : item.price.value.centAmount;
            const totalPrice = price * item.quantity;
            const imageUrl = item.variant.images?.[0]?.url;

            return (
              <Card className="p-4 flex flex-col sm:flex-row items-start gap-4" key={item.id}>
                <div className="relative h-32 w-24 flex-shrink-0">
                  {imageUrl ? (
                    <Image alt={productName} className="object-cover" fill src={imageUrl} />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Link className="font-medium hover:underline" href={`/products/${item.productId}`}>
                    {productName}
                  </Link>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">Quantity:</span>
                      <div className="flex items-center border rounded-md">
                        <Button
                          className="h-8 w-8"
                          disabled={isUpdating[item.id] || item.quantity <= 1}
                          // eslint-disable-next-line @typescript-eslint/no-misused-promises
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          size="icon"
                          variant="ghost"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 min-w-[40px] text-center">{item.quantity}</span>
                        <Button
                          className="h-8 w-8"
                          disabled={isUpdating[item.id]}
                          // eslint-disable-next-line @typescript-eslint/no-misused-promises
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          size="icon"
                          variant="ghost"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile-only trash button */}
                    <Button
                      className="sm:hidden bg-primary"
                      disabled={isRemoving[item.id]}
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      onClick={() => handleRemoveItem(item.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="font-medium mt-2">{formatPrice(totalPrice)}</div>
                </div>

                <Button
                  className="hidden sm:flex"
                  disabled={isRemoving[item.id]}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={() => handleRemoveItem(item.id)}
                  size="icon"
                  variant="ghost"
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </Card>
            );
          })}
        </div>
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-4 dark:text-amber-500/80">Order Summary</h2>
            {cart.discountOnTotalPrice?.discountedAmount.centAmount && (
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>{formatPrice(cart.discountOnTotalPrice?.discountedAmount.centAmount)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(cart?.totalPrice.centAmount)}</span>
            </div>

            <Button className="w-full mt-6">Proceed to Checkout</Button>

            <Link href="/">
              <Button className="w-full mt-4" variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
