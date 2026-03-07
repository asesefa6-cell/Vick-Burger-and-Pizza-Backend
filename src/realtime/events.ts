export type RealtimeRole = 'Super Admin' | 'Admin' | 'Manager' | 'Chef' | 'Waiter';

export interface OrderPlacedEvent {
  orderId: string;
  tableId: string;
  businessId: string;
  totalAmount: string;
  status: string;
  pendingAt?: string;
}

export interface OrderStatusUpdatedEvent {
  orderId: string;
  tableId: string;
  businessId: string;
  status: string;
  preparingAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
}

export interface PaymentCompletedEvent {
  orderId: string;
  tableId: string;
  businessId: string;
  amount: string;
  paymentId: string;
  paymentMethod: string;
  paymentDate: string;
}

export interface TableStatusUpdatedEvent {
  tableId: string;
  businessId: string;
  status: string;
}

export interface ServerToClientEvents {
  OrderPlaced: (payload: OrderPlacedEvent) => void;
  OrderStatusUpdated: (payload: OrderStatusUpdatedEvent) => void;
  PaymentCompleted: (payload: PaymentCompletedEvent) => void;
  TableStatusUpdated: (payload: TableStatusUpdatedEvent) => void;
}

export interface ClientToServerEvents {
  'join-kitchen': () => void;
  'join-staff': () => void;
  'join-admin': () => void;
  'join-table': (payload: { tableId: string; qrCode: string }) => void;
}
