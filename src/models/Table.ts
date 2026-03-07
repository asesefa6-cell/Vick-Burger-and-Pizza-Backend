import {
  Table as SequelizeTable,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  PrimaryKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { Business } from './Business';
import { Order } from './Order';
import { TableAssignment } from './TableAssignment';
import { TableRating } from './TableRating';

export interface TableAttributes {
  id: string;
  tableNumber: string;
  qrCode: string;
  businessId: string;
  isActive: boolean;
  isAvailable: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type TableCreationAttributes = Optional<
  TableAttributes,
  'id' | 'isActive' | 'isAvailable' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@SequelizeTable({
  tableName: 'tables',
  timestamps: true,
  paranoid: true,
})
export class Table extends BaseModel<TableAttributes, TableCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'table_id', type: DataType.UUID })
  declare id: string;

  @Column({ field: 'table_number', type: DataType.STRING, allowNull: false })
  declare tableNumber: string;

  @Column({ field: 'qr_code', type: DataType.STRING, allowNull: false })
  declare qrCode: string;

  @ForeignKey(() => Business)
  @Column({ field: 'business_id', type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @Column({ field: 'is_active', type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  @Column({ field: 'is_available', type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isAvailable: boolean;

  @Column({ field: 'status', type: DataType.STRING, allowNull: false, defaultValue: 'waiting' })
  declare status: string;

  @BelongsTo(() => Business)
  declare business?: Business;

  @HasMany(() => Order)
  declare orders?: Order[];

  @HasMany(() => TableAssignment)
  declare assignments?: TableAssignment[];

  @HasMany(() => TableRating)
  declare ratings?: TableRating[];
}
