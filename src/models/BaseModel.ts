import {
  Model,
  PrimaryKey,
  Default,
  Column,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  DataType,
} from 'sequelize-typescript';

export abstract class BaseModel<TModelAttributes extends {}, TCreationAttributes extends {}>
  extends Model<TModelAttributes, TCreationAttributes>
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  declare deletedAt?: Date | null;
}
