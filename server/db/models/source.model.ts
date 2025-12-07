import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../index";

interface SourceAttributes {
  id: string;
  name: string;
  link: string;

  is_active?: boolean;

  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  created_by: string;
  updated_by?: string | null;
  deleted_by?: string | null;
}

interface SourceCreationAttributes
  extends Optional<
    SourceAttributes,
    "is_active" | "updated_at" | "deleted_at" | "updated_by" | "deleted_by"
  > {}

class Source
  extends Model<SourceAttributes, SourceCreationAttributes>
  implements SourceAttributes
{
  public id!: string;
  public name!: string;
  public link!: string;

  public is_active!: boolean;

  public created_at!: Date;
  public updated_at?: Date;
  public deleted_at?: Date;

  public created_by!: string;
  public updated_by?: string;
  public deleted_by?: string;
}

Source.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(75),
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(75),
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.STRING(75),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "b_bookmarker_sources_tbl",
    timestamps: false,
  }
);

export default Source;
