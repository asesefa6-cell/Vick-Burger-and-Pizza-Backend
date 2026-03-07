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
import { Business } from './Business';

export interface PaymentMethodAttributes {
  id: string;
  businessId: string;
  name: string;
  type: string;
  isActive: boolean;
  chapaSecretKey?: string | null;
  chapaPublicKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type PaymentMethodCreationAttributes = Optional<
  PaymentMethodAttributes,
  'id' | 'isActive' | 'chapaSecretKey' | 'chapaPublicKey' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'payment_methods',
  timestamps: true,
  paranoid: true,
})
export class PaymentMethod extends BaseModel<PaymentMethodAttributes, PaymentMethodCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'payment_method_id', type: DataType.UUID })
  declare id: string;

  @ForeignKey(() => Business)
  @Column({ field: 'business_id', type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @Column({ field: 'name', type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ field: 'type', type: DataType.STRING, allowNull: false, defaultValue: 'manual' })
  declare type: string;

  @Column({ field: 'is_active', type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  @Column({ field: 'chapa_secret_key', type: DataType.STRING, allowNull: true })
  declare chapaSecretKey?: string | null;

  @Column({ field: 'chapa_public_key', type: DataType.STRING, allowNull: true })
  declare chapaPublicKey?: string | null;

  @BelongsTo(() => Business)
  declare business?: Business;
}
