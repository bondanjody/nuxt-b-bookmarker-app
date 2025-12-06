import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    CREATE TYPE "enum_b_bookmarker_users_tbl_role" AS ENUM (
      'B.BM.SUPERADMIN',
      'B.BM.ADMIN',
      'B.BM.USER'
    );
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    DROP TYPE "enum_b_bookmarker_users_tbl_role";
  `);
}