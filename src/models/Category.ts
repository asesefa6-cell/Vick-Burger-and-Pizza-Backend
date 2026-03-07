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
import { Business } from './Business';
import { MenuItem } from './MenuItem';

export interface CategoryAttributes {
  id: string;
  categoryName: string;
  description?: string | null;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'id' | 'description' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
})
export class Category extends BaseModel<CategoryAttributes, CategoryCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'category_id', type: DataType.UUID })
  declare id: string;

  @Column({ field: 'category_name', type: DataType.STRING, allowNull: false })
  declare categoryName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description?: string | null;

  @ForeignKey(() => Business)
  @Column({ field: 'business_id', type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @BelongsTo(() => Business)
  declare business?: Business;

  @HasMany(() => MenuItem)
  declare menuItems?: MenuItem[];
}
