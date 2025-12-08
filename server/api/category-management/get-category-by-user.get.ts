// server/api/category-management/get-category-by-user.get.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Category, User } from "~~/server/db/models"; // import dari index.ts
import type { UserRole } from "~~/server/db/models/user.model";

// --------------------------------------------------
// 🔐 Helper: Validasi JWT (semua role diperbolehkan)
// --------------------------------------------------
async function authorize(event: H3Event) {
  const authHeader = event.node.req.headers.authorization;

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: "Authorization header missing",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw createError({ statusCode: 401, message: "Token not provided" });
  }

  const config = useRuntimeConfig();

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const username = decoded?.username;
    const role = decoded?.role as UserRole | undefined;

    if (!username || !role) {
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    }

    return { username, role };
  } catch (err) {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

// --------------------------------------------------
// 📌 Main Handler: Get Category by User
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // Pastikan pengguna sudah login (role bebas)
  const authUser = await authorize(event);
  const { username } = authUser;

  // Ambil semua category milik user yang aktif
  const categories = await Category.findAll({
    where: {
      created_by: username,
      is_active: true,
    },
    order: [["created_at", "DESC"]], // opsional: urut berdasarkan tanggal dibuat
  });

  if (!categories || categories.length === 0) {
    return {
      message: "No categories found for the current user",
      categories: [],
    };
  }

  // Format hasil yang dikembalikan
  return {
    message: "Categories retrieved successfully",
    categories: categories.map((category) => ({
      id: category.dataValues.id,
      name: category.dataValues.name,
      is_active: category.dataValues.is_active,
      created_at: category.dataValues.created_at,
      updated_at: category.dataValues.updated_at,
    })),
  };
});
