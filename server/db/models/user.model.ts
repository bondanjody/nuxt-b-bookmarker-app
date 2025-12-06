import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../index";

export type UserRole = "B.BM.SUPERADMIN" | "B.BM.ADMIN" | "B.BM.USER";

interface UserAttributes {
  username: string;
  password: string;
  role?: UserRole;
  is_active?: boolean;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "role" | "is_active" | "updated_at" | "deleted_at"
  > {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public username!: string;
  public password!: string;
  public role!: UserRole;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at?: Date;
  public deleted_at?: Date;
}

User.init(
  {
    username: {
      type: DataTypes.STRING(75),
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("B.BM.SUPERADMIN", "B.BM.ADMIN", "B.BM.USER"),
      defaultValue: "B.BM.USER",
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
  },
  {
    sequelize,
    tableName: "b_bookmarker_users_tbl",
    timestamps: false,
  }
);

export default User;
