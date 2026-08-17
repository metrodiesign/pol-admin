export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatarUrl: string;
    ipAddress?: string;
  };
  date: string;
  time: string;
  items: number;
  price: number;
  status: OrderStatus;
  orderItems: OrderItem[];
}

export interface OrderItem {
  name: string;
  sku: string;
  imageUrl: string;
  qty: number;
  price: number;
}

export interface OrderDetail extends Order {
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  taxes: number;
  total: number;
  history: OrderHistoryEvent[];
  keyTimes: OrderKeyTime[];
  delivery: {
    shipBy: string;
    speedy: string;
    trackingNo: string;
  };
  shippingAddress: {
    address: string;
    phone: string;
  };
  payment: {
    cardLast4: string;
  };
}

export interface OrderHistoryEvent {
  label: string;
  datetime: string;
  done: boolean;
  active?: boolean;
}

export interface OrderKeyTime {
  label: string;
  datetime: string;
}
