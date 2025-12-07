// server/db/models/item.model.ts

import { DataTypes, Model, Optional, Association } from "sequelize";
import sequelize from "../index";

interface ItemAttributes {
  id: string;
  title: string;
  link: string;
  is_done?: boolean;
  notes: string;

  category: string;
  source: string;
  type: string;
  creator: string;

  is_active?: boolean;

  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  created_by: string;
  updated_by?: string | null;
  deleted_by?: string | null;

  // Menambahkan relasi sebagai properti tambahan
  categoryDetails?: any; // Relasi ke Category
  sourceDetails?: any; // Relasi ke Source
  typeDetails?: any; // Relasi ke Type
  creatorDetails?: any; // Relasi ke Creator
}

interface ItemCreationAttributes
  extends Optional<
    ItemAttributes,
    | "is_done"
    | "is_active"
    | "updated_at"
    | "deleted_at"
    | "updated_by"
    | "deleted_by"
  > {}

class Item extends Model<ItemAttributes, ItemCreationAttributes> {
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
  public created_at!: Date;
  public updated_at?: Date;
  public deleted_at?: Date;
  public created_by!: string;
  public updated_by?: string;
  public deleted_by?: string;

  // Add relation fields here
  public categoryDetails?: any;
  public sourceDetails?: any;
  public typeDetails?: any;
  public creatorDetails?: any;

  static associate() {
    // Import models dynamically here to avoid circular dependency
    const { Category, Source, Type, Creator } = require("./index"); // Dynamic import here

    Item.belongsTo(Category, { foreignKey: "category", as: "categoryDetails" });
    Item.belongsTo(Source, { foreignKey: "source", as: "sourceDetails" });
    Item.belongsTo(Type, { foreignKey: "type", as: "typeDetails" });
    Item.belongsTo(Creator, { foreignKey: "creator", as: "creatorDetails" });
  }
}

Item.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    link: { type: DataTypes.TEXT, allowNull: false },
    is_done: { type: DataTypes.BOOLEAN, defaultValue: false },
    notes: { type: DataTypes.STRING(200), allowNull: false },
    category: { type: DataTypes.UUID, allowNull: false },
    source: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.UUID, allowNull: false },
    creator: { type: DataTypes.UUID, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
    created_by: { type: DataTypes.STRING(75), allowNull: false },
    updated_by: { type: DataTypes.STRING(75), allowNull: true },
    deleted_by: { type: DataTypes.STRING(75), allowNull: true },
  },
  {
    sequelize,
    tableName: "b_bookmarker_items_tbl",
    timestamps: false,
  }
);

// Call associate method after defining the model
Item.associate();

export default Item;
