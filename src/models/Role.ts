import {
  Table,
  Column,
  DataType,
  HasMany,
  Default,
  PrimaryKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { User } from './User';

export interface RoleAttributes {
  id: string;
  roleName: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type RoleCreationAttributes = Optional<
  RoleAttributes,
  'id' | 'description' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'roles',
  timestamps: true,
  paranoid: true,
})
export class Role extends BaseModel<RoleAttributes, RoleCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'role_id', type: DataType.UUID })
  declare id: string;

  @Column({ field: 'role_name', type: DataType.STRING, allowNull: false })
  declare roleName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description?: string | null;

  @HasMany(() => User)
  declare users?: User[];
}
