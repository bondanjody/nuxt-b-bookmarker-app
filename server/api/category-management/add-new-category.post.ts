import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Category from "../../db/models/category.model";
import User, { UserRole } from "../../db/models/user.model";

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
    const role = decoded?.role as UserRole | undefined;

    if (!username || !role) {
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    }

    return { username, role };
  } catch {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

// --------------------------------------------------
// 📌 Main Handler: Add New Category
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login
  const authUser = await authorize(event);

  // Ambil body input
  const body = await readBody(event);
  const { name } = body;

  if (!name || typeof name !== "string") {
    throw createError({
      statusCode: 400,
      message: "Category name is required",
    });
  }

  // --------------------------------------------------
  // 🔍 VALIDASI CATEGORY SUDAH ADA
  // WHERE name = ? AND created_by = ? AND is_active = TRUE
  // --------------------------------------------------
  const existing = await Category.findOne({
    where: {
      name,
      created_by: authUser.username,
      is_active: true,
    },
  });

  if (existing) {
    throw createError({
      statusCode: 409,
      message: "You already have an active category with this name",
    });
  }

  // Buat ID UUID
  const { v4: uuidv4 } = await import("uuid");

  // Insert kategori baru
  const newCategory = await Category.create({
    id: uuidv4(),
    name,
    is_active: true,
    created_at: new Date(),
    created_by: authUser.username,
  });

  return {
    message: "Category created successfully",
    category: {
      id: newCategory.id,
      name: newCategory.name,
      created_by: newCategory.created_by,
      created_at: newCategory.created_at,
    },
  };
});
