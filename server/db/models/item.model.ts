import { Model, DataTypes, Optional, Sequelize } from "sequelize";

/**
 * Interface atribut Item
 */
export interface ItemAttributes {
  id: string;
  title: string;
  link: string;
  is_done: boolean;
  notes: string;

  category: string;
  source: string;
  type: string;
  creator: string;

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
export interface ItemCreationAttributes
  extends Optional<
    ItemAttributes,
    | "id"
    | "is_done"
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
export class Item
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: string;
  public title!: string;
  public link!: string;
  public is_done!: boolean;
  public notes!: string;

  public category!: string;
  public source!: string;
  public type!: string;
  public creator!: string;

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
export default function initItemModel(sequelize: Sequelize): typeof Item {
  Item.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      link: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      category: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      source: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      creator: {
        type: DataTypes.UUID,
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
      tableName: "b_bookmarker_items_tbl",
      modelName: "Item",

      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return Item;
}
