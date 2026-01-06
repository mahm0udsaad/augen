'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag } from 'lucide-react';

interface OrderHistoryItem {
  id: string;
  order_number: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_email?: string;
  customer_address: string;
  total_amount: number;
  items_total_amount: number;
  shipping_fee: number;
  status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    color?: string;
  }>;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const USER_ORDERS_STORAGE_KEY = 'augen_user_orders';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem(USER_ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearOrderHistory = () => {
    localStorage.removeItem(USER_ORDERS_STORAGE_KEY);
    setOrders([]);
  };

  if (loading) {
    return (
      <>
        <Header language="en" />
        <div className="min-h-screen bg-background pt-20 pb-24">
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <Package className="w-8 h-8 animate-spin" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header language="en" />
      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {orders.length} Order{orders.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-6">
              <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any orders yet. Start shopping to see your order history here.
                </p>
                <Button onClick={() => router.push('/categories')}>
                  Start Shopping
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearOrderHistory}
                  className="text-destructive hover:text-destructive"
                >
                  Clear History
                </Button>
              </div>

              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Package;
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">{order.order_number}</CardTitle>
                          <Badge className={`${statusColors[order.status]} text-white flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatPrice(order.total_amount)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Delivery Information</h3>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {order.customer_name}
                          </div>
                          <div>
                            <span className="font-medium">WhatsApp:</span> {order.customer_whatsapp}
                          </div>
                          {order.customer_email && (
                            <div>
                              <span className="font-medium">Email:</span> {order.customer_email}
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <span className="font-medium">Address:</span> {order.customer_address}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold mb-3">Items ({order.items.length})</h3>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-semibold">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × {formatPrice(item.unit_price)}
                                </p>
                                {item.color && (
                                  <p className="text-sm text-muted-foreground">
                                    Color: {item.color}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{formatPrice(item.total_price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Order Totals */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Items Subtotal:</span>
                          <span className="font-semibold">{formatPrice(order.items_total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping Fee:</span>
                          <span className="font-semibold">{formatPrice(order.shipping_fee)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span className="text-primary">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
