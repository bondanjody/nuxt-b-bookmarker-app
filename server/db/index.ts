// server/db/index.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  dialect: "postgres",
  logging: false,
  define: {
    timestamps: false, // karena kita menggunakan created_at, updated_at manual
    underscored: true,
  },
});

export default sequelize;
