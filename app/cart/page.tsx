'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Minus, Plus, ShoppingBag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Header from '@/components/header';
import CheckoutBottomSheet from '@/components/checkout-bottom-sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useShippingCities } from '@/hooks/use-shipping-cities';

const CUSTOMER_INFO_STORAGE_KEY = 'augen_checkout_info';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    cities: shippingCities,
    isLoading: isLoadingShippingCities,
  } = useShippingCities();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    whatsapp: '',
    email: '',
    address: '',
    notes: '',
    shippingCityId: '',
  });

  useEffect(() => {
    try {
      const storedInfo = localStorage.getItem(CUSTOMER_INFO_STORAGE_KEY);
      if (storedInfo) {
        const parsed = JSON.parse(storedInfo);
        setCustomerInfo((prev) => ({
          ...prev,
          ...parsed,
          shippingCityId: parsed.shippingCityId || prev.shippingCityId || '',
        }));
      }
    } catch (error) {
      console.error('Error loading checkout info:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_INFO_STORAGE_KEY, JSON.stringify(customerInfo));
    } catch (error) {
      console.error('Error saving checkout info:', error);
    }
  }, [customerInfo]);

  useEffect(() => {
    if (!isLoadingShippingCities && shippingCities.length > 0) {
      setCustomerInfo((prev) => {
        if (
          prev.shippingCityId &&
          shippingCities.some((city) => city.id === prev.shippingCityId)
        ) {
          return prev;
        }
        return { ...prev, shippingCityId: shippingCities[0].id };
      });
    }
  }, [isLoadingShippingCities, shippingCities]);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const cartSubtotal = getTotalPrice();
  const selectedShippingCity = shippingCities.find(
    (city) => city.id === customerInfo.shippingCityId
  );
  const shippingFee = selectedShippingCity?.shipping_fee ?? 0;
  const grandTotal = cartSubtotal + shippingFee;

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.whatsapp) {
      toast.error('Please enter your name and WhatsApp number');
      return;
    }
    if (!customerInfo.shippingCityId) {
      toast.error('Please select a shipping city');
      return;
    }

    // Validate WhatsApp number
    const whatsappRegex = /^[+]?[0-9]{10,15}$/;
    if (!whatsappRegex.test(customerInfo.whatsapp.replace(/\s/g, ''))) {
      toast.error('Invalid WhatsApp number');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerWhatsapp: customerInfo.whatsapp,
          customerEmail: customerInfo.email,
          customerAddress: customerInfo.address,
          notes: customerInfo.notes,
          shippingCityId: customerInfo.shippingCityId,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setOrderNumber(data.order.order_number);
      setIsOrderSubmitted(true);
      clearCart();
      toast.success('Order created successfully!');
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast.error(error.message || 'An error occurred while creating the order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(price);
  };

  if (items.length === 0 && !isOrderSubmitted) {
    return (
      <>
        <Header language="en" />
        <div className="min-h-screen bg-background pt-20 pb-24" dir="ltr">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <ShoppingBag className="w-20 h-20 sm:w-24 sm:h-24 text-muted-foreground" />
              <h1 className="text-2xl sm:text-3xl font-bold">Cart is Empty</h1>
              <p className="text-muted-foreground px-4">You haven't added any products to your cart yet</p>
              <Link href="/categories">
                <Button size="lg">Browse Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header language="en" />
      <div className="min-h-screen bg-background pt-20 pb-24" dir="ltr">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-1">Shopping Cart</h1>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-card rounded-lg p-3 sm:p-4 shadow-sm border overflow-hidden"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Product Image */}
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shrink-0"
                    />
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2">{item.productName}</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId)}
                          className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      
                      <p className="text-primary font-bold text-sm sm:text-base mb-2 sm:mb-3">
                        {formatPrice(item.unitPrice)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={item.maxQuantity}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId, parseInt(e.target.value) || 1)
                            }
                            className="w-14 sm:w-16 text-center h-8 sm:h-9 text-sm"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Available: {item.maxQuantity}
                        </span>
                      </div>
                      
                      {/* Total Price - Mobile */}
                      <div className="mt-2 sm:hidden pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total:</span>
                          <span className="font-bold text-base">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Price - Desktop */}
                    <div className="hidden sm:flex flex-col items-end justify-between shrink-0">
                      <p className="font-bold text-lg">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border lg:sticky lg:top-24">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-semibold">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-semibold">
                      {customerInfo.shippingCityId && shippingCities.length > 0
                        ? formatPrice(shippingFee)
                        : 'Select at checkout'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">
                        {customerInfo.shippingCityId && shippingCities.length > 0
                          ? formatPrice(grandTotal)
                          : formatPrice(cartSubtotal)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shipping fees depend on the selected city during checkout.
                    </p>
                  </div>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Checkout
                </Button>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full mt-2"
                  size="lg"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout - Desktop Dialog / Mobile Bottom Sheet */}
      {isDesktop ? (
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="max-w-2xl" dir="ltr">
            {isOrderSubmitted ? (
              <div className="text-center py-8 space-y-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <DialogHeader>
                  <DialogTitle className="text-2xl">Order Created Successfully!</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-lg">
                    Order Number: <span className="font-bold text-primary">{orderNumber}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Our sales team will contact you soon via WhatsApp to confirm your order
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href="/categories">
                    <Button size="lg">Continue Shopping</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsOrderSubmitted(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Complete Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">
                      WhatsApp Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="whatsapp"
                      value={customerInfo.whatsapp}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, whatsapp: e.target.value })
                      }
                      placeholder="+20 1234567890"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      We will contact you via this number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, email: e.target.value })
                      }
                      placeholder="example@domain.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address (optional)</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, address: e.target.value })
                      }
                      placeholder="Enter your full address"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={customerInfo.notes}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, notes: e.target.value })
                      }
                      placeholder="Any special notes for the order"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Shipping City <span className="text-destructive">*</span>
                    </Label>
                    <select
                      className="w-full rounded-md border px-3 py-2 min-h-[48px]"
                      value={customerInfo.shippingCityId}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, shippingCityId: e.target.value })
                      }
                      disabled={isLoadingShippingCities || shippingCities.length === 0}
                    >
                      {shippingCities.length === 0 ? (
                        <option value="">No shipping cities available</option>
                      ) : (
                        shippingCities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name_en} - {formatPrice(city.shipping_fee)}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Shipping fee: {formatPrice(shippingFee)}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items Subtotal</span>
                        <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-semibold">{formatPrice(shippingFee)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-1">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleSubmitOrder}
                      className="w-full"
                      size="lg"
                      disabled={
                        isSubmitting ||
                        !customerInfo.shippingCityId ||
                        shippingCities.length === 0
                      }
                    >
                      {isSubmitting ? 'Submitting...' : 'Confirm Order'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <CheckoutBottomSheet
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            if (isOrderSubmitted) {
              setIsOrderSubmitted(false);
            }
          }}
          customerInfo={customerInfo}
          onCustomerInfoChange={setCustomerInfo}
          onSubmitOrder={handleSubmitOrder}
          isSubmitting={isSubmitting}
          isOrderSubmitted={isOrderSubmitted}
          orderNumber={orderNumber}
          shippingCities={shippingCities}
          selectedShippingCityId={customerInfo.shippingCityId}
          onShippingCityChange={(cityId) =>
            setCustomerInfo((prev) => ({ ...prev, shippingCityId: cityId }))
          }
          isLoadingShippingCities={isLoadingShippingCities}
          totals={{
            items: formatPrice(cartSubtotal),
            shipping: formatPrice(shippingFee),
            grand: formatPrice(grandTotal),
          }}
        />
      )}
    </>
  );
}
