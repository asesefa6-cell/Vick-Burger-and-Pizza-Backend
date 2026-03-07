import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
  Default,
  PrimaryKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { Role } from './Role';
import { Business } from './Business';
import { UserBusiness } from './UserBusiness';
import { File } from './File';
import { TableAssignment } from './TableAssignment';
import { TableRating } from './TableRating';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
  businessId?: string | null;
  profileFileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'businessId' | 'profileFileId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends BaseModel<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ field: 'password_hash', type: DataType.STRING, allowNull: false })
  declare passwordHash: string;

  @ForeignKey(() => Role)
  @Column({ field: 'role_id', type: DataType.UUID, allowNull: false })
  declare roleId: string;

  @ForeignKey(() => Business)
  @Column({ field: 'business_id', type: DataType.UUID, allowNull: true })
  declare businessId?: string | null;

  @ForeignKey(() => File)
  @Column({ field: 'profile_file_id', type: DataType.UUID, allowNull: true })
  declare profileFileId?: string | null;

  @BelongsTo(() => Role)
  declare role?: Role;

  @BelongsTo(() => Business)
  declare business?: Business;

  @BelongsTo(() => File, { as: 'profileFile' })
  declare profileFile?: File;

  @BelongsToMany(() => Business, () => UserBusiness)
  declare businesses?: Business[];

  @HasMany(() => TableAssignment, { foreignKey: 'waiterId', as: 'tableAssignments' })
  declare tableAssignments?: TableAssignment[];

  @HasMany(() => TableRating, { foreignKey: 'waiterId', as: 'tableRatings' })
  declare tableRatings?: TableRating[];
}
