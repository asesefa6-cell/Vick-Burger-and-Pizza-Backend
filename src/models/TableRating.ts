import {
  Table as SequelizeTable,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  PrimaryKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { Table } from './Table';
import { User } from './User';
import { Business } from './Business';

export interface TableRatingAttributes {
  id: string;
  tableId: string;
  waiterId: string;
  businessId: string;
  rating: number;
  visitEndedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type TableRatingCreationAttributes = Optional<
  TableRatingAttributes,
  'id' | 'visitEndedAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@SequelizeTable({
  tableName: 'table_ratings',
  timestamps: true,
  paranoid: true,
  indexes: [
    { name: 'idx_table_ratings_waiter', fields: ['waiter_id'] },
    { name: 'idx_table_ratings_table', fields: ['table_id'] },
  ],
})
export class TableRating extends BaseModel<TableRatingAttributes, TableRatingCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'rating_id', type: DataType.UUID })
  declare id: string;

  @ForeignKey(() => Table)
  @Column({ field: 'table_id', type: DataType.UUID, allowNull: false })
  declare tableId: string;

  @ForeignKey(() => User)
  @Column({ field: 'waiter_id', type: DataType.UUID, allowNull: false })
  declare waiterId: string;

  @ForeignKey(() => Business)
  @Column({ field: 'business_id', type: DataType.UUID, allowNull: false })
  declare businessId: string;

  @Column({ field: 'rating', type: DataType.INTEGER, allowNull: false })
  declare rating: number;

  @Column({ field: 'visit_ended_at', type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare visitEndedAt: Date;

  @BelongsTo(() => Table)
  declare table?: Table;

  @BelongsTo(() => User, { as: 'waiter', foreignKey: 'waiterId' })
  declare waiter?: User;

  @BelongsTo(() => Business)
  declare business?: Business;
}
