export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered';
export type PaymentProvider = 'Chapa' | 'AddisPay' | 'CardDemo';

export interface PlaceOrderItemInput {
  itemId: string;
  quantity: number;
  specialInstruction?: string;
}

export interface PlaceOrderInput {
  tableId: string;
  items: PlaceOrderItemInput[];
  paymentMethod?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export interface PaymentInput {
  provider: PaymentProvider;
  paymentMethod: string;
  transactionReference?: string;
}

export interface Receipt {
  receiptId: string;
  orderId: string;
  paymentId: string;
  amount: string;
  paymentDate: string;
  provider: PaymentProvider;
}
