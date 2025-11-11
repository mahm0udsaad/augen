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

const CUSTOMER_INFO_STORAGE_KEY = 'augen_checkout_info';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    whatsapp: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    try {
      const storedInfo = localStorage.getItem(CUSTOMER_INFO_STORAGE_KEY);
      if (storedInfo) {
        const parsed = JSON.parse(storedInfo);
        setCustomerInfo((prev) => ({ ...prev, ...parsed }));
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

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.whatsapp) {
      toast.error('Please enter your name and WhatsApp number');
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
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <ShoppingBag className="w-24 h-24 text-muted-foreground" />
              <h1 className="text-2xl font-bold">Cart is Empty</h1>
              <p className="text-muted-foreground">You haven't added any products to your cart yet</p>
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
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-card rounded-lg p-4 shadow-sm border flex gap-4 overflow-hidden"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.productName}</h3>
                    <p className="text-primary font-bold mb-3">
                      {formatPrice(item.unitPrice)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, parseInt(e.target.value) || 1)
                        }
                        className="w-16 text-center"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground mr-2">
                        (Available: {item.maxQuantity})
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <p className="font-bold text-lg">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 shadow-sm border sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-semibold">{items.length}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>
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

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <Button
                      onClick={handleSubmitOrder}
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
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
          totalPrice={formatPrice(getTotalPrice())}
        />
      )}
    </>
  );
}
