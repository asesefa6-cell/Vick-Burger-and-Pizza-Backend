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

export interface TableAssignmentAttributes {
  id: string;
  tableId: string;
  waiterId: string;
  assignedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type TableAssignmentCreationAttributes = Optional<
  TableAssignmentAttributes,
  'id' | 'assignedBy' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@SequelizeTable({
  tableName: 'table_assignments',
  timestamps: true,
  paranoid: true,
})
export class TableAssignment extends BaseModel<TableAssignmentAttributes, TableAssignmentCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'assignment_id', type: DataType.UUID })
  declare id: string;

  @ForeignKey(() => Table)
  @Column({ field: 'table_id', type: DataType.UUID, allowNull: false, unique: true })
  declare tableId: string;

  @ForeignKey(() => User)
  @Column({ field: 'waiter_id', type: DataType.UUID, allowNull: false })
  declare waiterId: string;

  @ForeignKey(() => User)
  @Column({ field: 'assigned_by', type: DataType.UUID, allowNull: true })
  declare assignedBy?: string | null;

  @BelongsTo(() => Table)
  declare table?: Table;

  @BelongsTo(() => User, { as: 'waiter', foreignKey: 'waiterId' })
  declare waiter?: User;

  @BelongsTo(() => User, { as: 'assigner', foreignKey: 'assignedBy' })
  declare assigner?: User;
}
