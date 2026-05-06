import {
  Table,
  Column,
  DataType,
  HasMany,
  BelongsTo,
  BelongsToMany,
  Default,
  PrimaryKey,
  ForeignKey,
} from "sequelize-typescript";
import { Optional } from "sequelize";
import { BaseModel } from "./BaseModel";
import { Table as RestaurantTable } from "./Table";
import { Category } from "./Category";
import { MenuItem } from "./MenuItem";
import { User } from "./User";
import { UserBusiness } from "./UserBusiness";
import { File } from "./File";
import { PaymentMethod } from "./PaymentMethod";

export interface BusinessAttributes {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  logoFileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type BusinessCreationAttributes = Optional<
  BusinessAttributes,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

@Table({
  tableName: "businesses",
  timestamps: true,
  paranoid: true,
})
export class Business extends BaseModel<
  BusinessAttributes,
  BusinessCreationAttributes
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: "business_id", type: DataType.UUID })
  declare id: string;

  @Column({ field: "business_name", type: DataType.STRING, allowNull: false })
  declare businessName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare address: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare phone: string;

  @Default(true)
  @Column({ field: "is_active", type: DataType.BOOLEAN, allowNull: false })
  declare isActive: boolean;

  @ForeignKey(() => File)
  @Column({ field: "logo_file_id", type: DataType.UUID, allowNull: true })
  declare logoFileId?: string | null;

  @BelongsTo(() => File, { as: "logoFile" })
  declare logoFile?: File;

  @HasMany(() => RestaurantTable)
  declare tables?: RestaurantTable[];

  @HasMany(() => Category)
  declare categories?: Category[];

  @HasMany(() => MenuItem)
  declare menuItems?: MenuItem[];

  @HasMany(() => User)
  declare users?: User[];

  @BelongsToMany(() => User, () => UserBusiness)
  declare admins?: User[];

  @HasMany(() => PaymentMethod)
  declare paymentMethods?: PaymentMethod[];
}
