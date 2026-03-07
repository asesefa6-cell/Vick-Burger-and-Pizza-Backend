import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne,
  Default,
  PrimaryKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { Table as RestaurantTable } from './Table';
import { OrderItem } from './OrderItem';
import { Payment } from './Payment';

export interface OrderAttributes {
  id: string;
  tableId: string;
  status: string;
  totalAmount: string;
  paymentMethod?: string | null;
  pendingAt?: Date | null;
  preparingAt?: Date | null;
  readyAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type OrderCreationAttributes = Optional<
  OrderAttributes,
  'id' | 'paymentMethod' | 'pendingAt' | 'preparingAt' | 'readyAt' | 'deliveredAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'orders',
  timestamps: true,
  paranoid: true,
})
export class Order extends BaseModel<OrderAttributes, OrderCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'order_id', type: DataType.UUID })
  declare id: string;

  @ForeignKey(() => RestaurantTable)
  @Column({ field: 'table_id', type: DataType.UUID, allowNull: false })
  declare tableId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare status: string;

  @Column({ field: 'total_amount', type: DataType.DECIMAL(10, 2), allowNull: false })
  declare totalAmount: string;

  @Column({ field: 'payment_method', type: DataType.STRING, allowNull: true })
  declare paymentMethod?: string | null;

  @Column({ field: 'pending_at', type: DataType.DATE, allowNull: true })
  declare pendingAt?: Date | null;

  @Column({ field: 'preparing_at', type: DataType.DATE, allowNull: true })
  declare preparingAt?: Date | null;

  @Column({ field: 'ready_at', type: DataType.DATE, allowNull: true })
  declare readyAt?: Date | null;

  @Column({ field: 'delivered_at', type: DataType.DATE, allowNull: true })
  declare deliveredAt?: Date | null;

  @BelongsTo(() => RestaurantTable)
  declare table?: RestaurantTable;

  @HasMany(() => OrderItem)
  declare orderItems?: OrderItem[];

  @HasOne(() => Payment)
  declare payment?: Payment;
}
