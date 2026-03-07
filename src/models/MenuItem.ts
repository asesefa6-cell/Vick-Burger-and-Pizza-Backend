import {
  Table,
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
import { Category } from './Category';
import { Business } from './Business';
import { OrderItem } from './OrderItem';

export interface MenuItemAttributes {
  id: string;
  itemName: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  availabilityStatus: boolean;
  itemType?: string | null;
  directToWaiter: boolean;
  categoryId: string;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type MenuItemCreationAttributes = Optional<
  MenuItemAttributes,
  'id' | 'description' | 'imageUrl' | 'itemType' | 'directToWaiter' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'menu_items',
  timestamps: true,
  paranoid: true,
})
export class MenuItem extends BaseModel<MenuItemAttributes, MenuItemCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'item_id', type: DataType.UUID })
  declare id: string;

  @Column({ field: 'item_name', type: DataType.STRING, allowNull: false })
  declare itemName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description?: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: string;

  @Column({ field: 'image_url', type: DataType.STRING, allowNull: true })
  declare imageUrl?: string | null;

  @Column({ field: 'availability_status', type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare availabilityStatus: boolean;

  @Column({ field: 'item_type', type: DataType.STRING, allowNull: true })
  declare itemType?: string | null;

  @Column({ field: 'direct_to_waiter', type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare directToWaiter: boolean;

  @ForeignKey(() => Category)
  @Column({ field: 'category_id', type: DataType.UUID, allowNull: false })
  declare categoryId: string;

  @ForeignKey(() => Business)
  @Column({ field: 'business_id', type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @BelongsTo(() => Category)
  declare category?: Category;

  @BelongsTo(() => Business)
  declare business?: Business;

  @HasMany(() => OrderItem)
  declare orderItems?: OrderItem[];
}
