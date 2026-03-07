import {
  Table,
  Column,
  DataType,
  Default,
  PrimaryKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';

export interface FileAttributes {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type FileCreationAttributes = Optional<
  FileAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  tableName: 'files',
  timestamps: true,
  paranoid: true,
})
export class File extends BaseModel<FileAttributes, FileCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ field: 'file_id', type: DataType.UUID })
  declare id: string;

  @Column({ field: 'original_name', type: DataType.STRING, allowNull: false })
  declare originalName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare filename: string;

  @Column({ field: 'mime_type', type: DataType.STRING, allowNull: false })
  declare mimeType: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare size: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare path: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare url: string;
}
