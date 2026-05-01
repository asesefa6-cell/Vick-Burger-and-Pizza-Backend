import {
  Table,
  Column,
  DataType,
  ForeignKey,
  Default,
  PrimaryKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { User } from './User';
import { Business } from './Business';

export interface UserBusinessAttributes {
  id: string;
  userId: string;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type UserBusinessCreationAttributes = Optional<
  UserBusinessAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'user_businesses',
  timestamps: true,
  paranoid: true,
})
export class UserBusiness extends BaseModel<UserBusinessAttributes, UserBusinessCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'user_business_id', type: DataType.UUID })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ field: 'user_id', type: DataType.UUID, allowNull: false })
  declare userId: string;

  @ForeignKey(() => Business)
  @Column({ field: 'business_id', type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Business)
  declare business?: Business;
}
