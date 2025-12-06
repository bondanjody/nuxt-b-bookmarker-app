/*
This table is for data such as : YouTube Video, TikTok Post, Article, Journal, Book, etc.
*/

import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable("b_bookmarker_items_tbl", {
    id: {
      type: DataTypes.UUID,
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
      defaultValue: false,
    },
    notes: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(75),
      allowNull: false,
      references: {
        model: "b_bookmarker_categories_tbl",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    source: {
      type: DataTypes.STRING(75),
      allowNull: false,
      references: {
        model: "b_bookmarker_sources_tbl",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    type: {
      type: DataTypes.STRING(75),
      allowNull: false,
      references: {
        model: "b_bookmarker_types_tbl",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    creator: {
      type: DataTypes.STRING(75),
      allowNull: false,
      references: {
        model: "b_bookmarker_creators_tbl",
        key: "id",
      },
      onDelete: "RESTRICT",
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

    created_by: {
      type: DataTypes.STRING(75),
      allowNull: false,
      references: {
        model: "b_bookmarker_users_tbl",
        key: "username",
      },
      onDelete: "RESTRICT",
    },
    updated_by: {
      type: DataTypes.STRING(75),
      references: {
        model: "b_bookmarker_users_tbl",
        key: "username",
      },
    },
    deleted_by: {
      type: DataTypes.STRING(75),
      references: {
        model: "b_bookmarker_users_tbl",
        key: "username",
      },
    },
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("b_bookmarker_items_tbl");
}
