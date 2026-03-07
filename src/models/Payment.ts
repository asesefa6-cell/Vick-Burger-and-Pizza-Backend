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

export interface PaymentAttributes {
  id: string;
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference?: string | null;
  paymentDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  'id' | 'transactionReference' | 'paymentDate' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'payments',
  timestamps: true,
  paranoid: true,
})
export class Payment extends BaseModel<PaymentAttributes, PaymentCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'payment_id', type: DataType.UUID })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({ field: 'order_id', type: DataType.UUID, allowNull: false })
  declare orderId: string;

  @Column({ field: 'payment_method', type: DataType.STRING, allowNull: false })
  declare paymentMethod: string;

  @Column({ field: 'payment_status', type: DataType.STRING, allowNull: false })
  declare paymentStatus: string;

  @Column({ field: 'transaction_reference', type: DataType.STRING, allowNull: true })
  declare transactionReference?: string | null;

  @Column({ field: 'payment_date', type: DataType.DATE, allowNull: true })
  declare paymentDate?: Date | null;

  @BelongsTo(() => Order)
  declare order?: Order;
}
