import { Model, DataTypes, Optional, Sequelize } from "sequelize";

/**
 * Interface atribut Type
 */
export interface TypeAttributes {
  id: string;
  name: string;
  is_active: boolean;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;

  created_by: string;
  updated_by?: string | null;
  deleted_by?: string | null;
}

/**
 * Atribut opsional saat create
 */
export interface TypeCreationAttributes
  extends Optional<
    TypeAttributes,
    | "id"
    | "is_active"
    | "created_at"
    | "updated_at"
    | "deleted_at"
    | "updated_by"
    | "deleted_by"
  > {}

/**
 * Model class
 */
export class Type
  extends Model<TypeAttributes, TypeCreationAttributes>
  implements TypeAttributes
{
  public id!: string;
  public name!: string;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  public created_by!: string;
  public updated_by!: string | null;
  public deleted_by!: string | null;
}

/**
 * Init model
 */
export default function initTypeModel(sequelize: Sequelize): typeof Type {
  Type.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },

      created_by: {
        type: DataTypes.STRING(75),
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.STRING(75),
      },
      deleted_by: {
        type: DataTypes.STRING(75),
      },
    },
    {
      sequelize,
      tableName: "b_bookmarker_types_tbl",
      modelName: "Type",

      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return Type;
}
