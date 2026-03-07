import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  PrimaryKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { Order } from './Order';
import { MenuItem } from './MenuItem';

export interface OrderItemAttributes {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  specialInstruction?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type OrderItemCreationAttributes = Optional<
  OrderItemAttributes,
  'id' | 'specialInstruction' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'order_items',
  timestamps: true,
  paranoid: true,
})
export class OrderItem extends BaseModel<OrderItemAttributes, OrderItemCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'order_item_id', type: DataType.UUID })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({ field: 'order_id', type: DataType.UUID, allowNull: false })
  declare orderId: string;

  @ForeignKey(() => MenuItem)
  @Column({ field: 'item_id', type: DataType.UUID, allowNull: false })
  declare itemId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare quantity: number;

  @Column({ field: 'special_instruction', type: DataType.TEXT, allowNull: true })
  declare specialInstruction?: string | null;

  @BelongsTo(() => Order)
  declare order?: Order;

  @BelongsTo(() => MenuItem)
  declare menuItem?: MenuItem;
}
