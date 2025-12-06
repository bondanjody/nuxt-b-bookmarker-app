/*
This table is for data such as : YouTube, detikCom, etc.
*/

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('b_bookmarker_sources_tbl', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,

    created_by: {
      type: DataTypes.STRING(75),
      allowNull: false,
      references: {
        model: 'b_bookmarker_users_tbl',
        key: 'username'
      },
      onDelete: 'RESTRICT'
    },
    updated_by: {
      type: DataTypes.STRING(75),
      references: {
        model: 'b_bookmarker_users_tbl',
        key: 'username'
      }
    },
    deleted_by: {
      type: DataTypes.STRING(75),
      references: {
        model: 'b_bookmarker_users_tbl',
        key: 'username'
      }
    }
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('b_bookmarker_sources_tbl');
}
