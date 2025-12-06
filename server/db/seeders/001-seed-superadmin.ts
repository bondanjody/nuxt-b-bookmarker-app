import { QueryInterface } from "sequelize";
import bcrypt from "bcrypt";

export async function up(queryInterface: QueryInterface) {
  const username = "superadmin";
  const plainPassword = "superadmin123"; // ⛔ ganti setelah login pertama
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  await queryInterface.bulkInsert("b_bookmarker_users_tbl", [
    {
      username: username,
      password: hashedPassword,
      role: "B.BM.SUPERADMIN",
      is_active: true,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    },
  ]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete("b_bookmarker_users_tbl", {
    username: "superadmin",
  });
}
