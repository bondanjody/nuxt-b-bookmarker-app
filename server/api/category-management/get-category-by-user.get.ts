// server/api/category-management/get-category-by-user.get.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Category from "~~/server/db/models/category.model";

// --------------------------------------------------
// 🔐 Helper: Validasi JWT (all roles allowed)
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
    const role = decoded?.role;

    if (!username || !role) {
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    }

    return { username, role };
  } catch (err) {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

// --------------------------------------------------
// 📌 Main Handler: Get Category By User
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login
  const authUser = await authorize(event);

  // Cari kategori berdasarkan user yang login (created_by)
  const categories = await Category.findAll({
    where: {
      created_by: authUser.username, // Menyaring kategori berdasarkan user yang membuatnya
      is_active: true, // Hanya kategori yang aktif
    },
  });

  if (categories.length === 0) {
    throw createError({
      statusCode: 404,
      message: "No categories found for this user",
    });
  }

  // Kembalikan data kategori
  return {
    message: "Categories fetched successfully",
    categories: categories.map((category) => ({
      id: category.dataValues.id,
      name: category.dataValues.name,
      created_by: category.dataValues.created_by,
      created_at: category.dataValues.created_at,
      is_active: category.dataValues.is_active,
    })),
  };
});
