'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import AdminHeader from '@/components/admin-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Eye, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ShippingCityRef {
  id: string;
  name_en: string;
  name_ar?: string;
  shipping_fee: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_email?: string;
  customer_address?: string;
  status: string;
  total_amount: number;
  items_total_amount: number;
  shipping_fee: number;
  shipping_city_id?: string | null;
  shipping_city?: ShippingCityRef | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
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
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthed, isLoading: authLoading } = useAdminAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const normalizeOrder = (order: any): Order => ({
    ...order,
    total_amount: Number(order.total_amount) || 0,
    items_total_amount:
      Number(order.items_total_amount ?? order.total_amount) || 0,
    shipping_fee: Number(order.shipping_fee) || 0,
    order_items: (order.order_items || []).map((item: any) => ({
      ...item,
      unit_price: Number(item.unit_price) || 0,
      total_price: Number(item.total_price) || 0,
    })),
    shipping_city: order.shipping_city
      ? {
          ...order.shipping_city,
          shipping_fee: Number(order.shipping_city.shipping_fee) || 0,
        }
      : null,
  })

  useEffect(() => {
    if (!authLoading && !isAuthed) {
      router.push('/admin/login');
    }
  }, [isAuthed, authLoading, router]);

  useEffect(() => {
    if (isAuthed) {
      fetchOrders();
    }
  }, [isAuthed, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/orders' 
        : `/api/orders?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const normalized = (data.orders || []).map((order: any) =>
          normalizeOrder(order)
        );
        setOrders(normalized);
      } else {
        toast.error('فشل في تحميل الطلبات');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تحديث حالة الطلب');
        fetchOrders();
        if (selectedOrder?.id === orderId && data.order) {
          setSelectedOrder(normalizeOrder(data.order));
        }
      } else {
        toast.error('فشل تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('حدث خطأ أثناء تحديث الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  const openWhatsApp = (phone: string, orderNumber: string) => {
    const message = encodeURIComponent(
      `مرحباً! بخصوص طلبك رقم ${orderNumber}. كيف يمكنني مساعدتك؟`
    );

    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly) {
      toast.error('رقم الهاتف غير صالح');
      return;
    }

    const trimmedNumber = digitsOnly.replace(/^0+/, '');
    if (!trimmedNumber) {
      toast.error('رقم الهاتف غير صالح');
      return;
    }

    const normalizedPhone = trimmedNumber.startsWith('20')
      ? trimmedNumber
      : `20${trimmedNumber}`;

    window.open(`https://wa.me/${normalizedPhone}?text=${message}`, '_blank');
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_whatsapp.includes(searchQuery)
    );
  });

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'number' ? price : Number(price)
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(Number.isNaN(numericPrice) ? 0 : numericPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {filteredOrders.length} طلب
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الواتساب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="confirmed">مؤكد</SelectItem>
              <SelectItem value="processing">قيد المعالجة</SelectItem>
              <SelectItem value="shipped">تم الشحن</SelectItem>
              <SelectItem value="delivered">تم التوصيل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusIcons[order.status];
              return (
                <div
                  key={order.id}
                  className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{order.order_number}</h3>
                        <Badge className={`${statusColors[order.status]} text-white`}>
                          <StatusIcon className="w-4 h-4 ml-1" />
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-semibold">العميل:</span> {order.customer_name}
                        </p>
                        <p>
                          <span className="font-semibold">الواتساب:</span>{' '}
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              openWhatsApp(order.customer_whatsapp, order.order_number);
                            }}
                            className="text-green-600 hover:underline"
                          >
                            {order.customer_whatsapp}
                          </a>
                        </p>
                        <p>
                          <span className="font-semibold">التاريخ:</span>{' '}
                          {formatDate(order.created_at)}
                        </p>
                        <p>
                          <span className="font-semibold">المنتجات:</span>{' '}
                          {order.order_items?.length || 0}
                        </p>
                        {order.shipping_city && (
                          <p>
                            <span className="font-semibold">مدينة الشحن:</span>{' '}
                            {(order.shipping_city.name_ar || order.shipping_city.name_en) ?? '-'}
                            {' '}- {formatPrice(order.shipping_fee)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(order.total_amount)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openWhatsApp(order.customer_whatsapp, order.order_number)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          واتساب
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  تفاصيل الطلب {selectedOrder.order_number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">معلومات العميل</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold">الاسم:</span> {selectedOrder.customer_name}
                    </div>
                    <div>
                      <span className="font-semibold">الواتساب:</span>{' '}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          openWhatsApp(selectedOrder.customer_whatsapp, selectedOrder.order_number);
                        }}
                        className="text-green-600 hover:underline"
                      >
                        {selectedOrder.customer_whatsapp}
                      </a>
                    </div>
                    {selectedOrder.customer_email && (
                      <div>
                        <span className="font-semibold">البريد:</span> {selectedOrder.customer_email}
                      </div>
                    )}
                    {selectedOrder.customer_address && (
                      <div className="md:col-span-2">
                        <span className="font-semibold">العنوان:</span> {selectedOrder.customer_address}
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.shipping_city && (
                  <div className="bg-secondary p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-3">تفاصيل الشحن</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-semibold">المدينة:</span>{' '}
                        {(selectedOrder.shipping_city.name_ar ||
                          selectedOrder.shipping_city.name_en) ?? '-'}
                      </div>
                      <div>
                        <span className="font-semibold">رسوم الشحن:</span>{' '}
                        {formatPrice(selectedOrder.shipping_fee)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Status */}
                <div>
                  <h3 className="font-bold text-lg mb-3">حالة الطلب</h3>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="processing">قيد المعالجة</SelectItem>
                      <SelectItem value="shipped">تم الشحن</SelectItem>
                      <SelectItem value="delivered">تم التوصيل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-lg mb-3">المنتجات</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 bg-secondary rounded-lg"
                      >
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            الكمية: {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary">
                            {formatPrice(item.total_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">ملاحظات</h3>
                    <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">إجمالي المنتجات</span>
                      <span className="font-semibold">
                        {formatPrice(selectedOrder.items_total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رسوم الشحن</span>
                      <span className="font-semibold">
                        {formatPrice(selectedOrder.shipping_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold pt-1">
                      <span>المجموع الكلي:</span>
                      <span className="text-primary">
                        {formatPrice(selectedOrder.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>تاريخ الإنشاء: {formatDate(selectedOrder.created_at)}</p>
                  <p>آخر تحديث: {formatDate(selectedOrder.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
