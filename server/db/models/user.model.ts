import { Model, DataTypes, Optional, Sequelize } from "sequelize";

// ==============================
// 1️⃣ Define UserRole Type
// ==============================
export type UserRole = "B.BM.USER" | "B.BM.ADMIN" | "B.BM.SUPERADMIN";

/**
 * Interface atribut penuh user
 */
export interface UserAttributes {
  username: string;
  password: string;
  role: UserRole; // gunakan UserRole type
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

/**
 * Atribut opsional saat create
 */
export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "role" | "is_active" | "created_at" | "updated_at" | "deleted_at"
  > {}

/**
 * Model class
 */
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public username!: string;
  public password!: string;
  public role!: UserRole;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

/**
 * Init model
 */
export default function initUserModel(sequelize: Sequelize): typeof User {
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
        type: DataTypes.ENUM("B.BM.USER", "B.BM.ADMIN", "B.BM.SUPERADMIN"),
        allowNull: false,
        defaultValue: "B.BM.USER",
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
    },
    {
      sequelize,
      tableName: "b_bookmarker_users_tbl",
      modelName: "User",

      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return User;
}
