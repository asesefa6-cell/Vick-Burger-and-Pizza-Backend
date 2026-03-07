import { OrderStatus } from '../order/types';

export interface ActiveOrderItem {
  itemId: string;
  itemName: string;
  itemImageUrl?: string | null;
  quantity: number;
  specialInstruction?: string | null;
}

export interface ActiveOrder {
  orderId: string;
  tableId: string;
  tableNumber: string;
  status: OrderStatus;
  totalAmount: string;
  timePlaced: string;
  items: ActiveOrderItem[];
}

export interface ActiveOrdersQuery {
  tableId?: string;
}

export interface UpdateStatusInput {
  status: OrderStatus;
}
