import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable("b_bookmarker_users_tbl", {
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
      type: "enum_b_bookmarker_users_tbl_role",
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
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("b_bookmarker_users_tbl");
}
