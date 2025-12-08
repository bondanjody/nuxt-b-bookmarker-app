// server/api/item-management/get-item-by-user.get.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as models from "~~/server/db/models"; // ✅
const { Item, Category, Source, Type, Creator } = models;
import { UserRole } from "~~/server/db/models/user.model";

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
// 📌 Main Handler: Get Item by User
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  const authUser = await authorize(event);
  const { username } = authUser;

  // Ambil item yang dibuat oleh user berdasarkan username
  const items = await Item.findAll({
    where: { created_by: username, is_active: true },
    include: [
      {
        model: Category,
        as: "category_data",
        attributes: ["id", "name", "is_active"],
      },
      {
        model: Source,
        as: "source_data",
        attributes: ["id", "name", "link", "is_active"],
      },
      {
        model: Type,
        as: "type_data",
        attributes: ["id", "name", "is_active"],
      },
      {
        model: Creator,
        as: "creator_data",
        attributes: ["id", "name", "link", "is_active"],
      },
    ],
    order: [["created_at", "DESC"]], // optional: urutkan berdasarkan created_at terbaru
  });

  if (!items || items.length === 0) {
    throw createError({
      statusCode: 404,
      message: "No items found for the current user",
    });
  }

  // Format response tanpa dataValues
  const result = items.map((item) => ({
    id: item.dataValues.id,
    title: item.dataValues.title,
    link: item.dataValues.link,
    notes: item.dataValues.notes,
    is_done: item.dataValues.is_done,
    is_active: item.dataValues.is_active,
    created_at: item.dataValues.created_at,
    updated_at: item.dataValues.updated_at,
    created_by: item.created_by,
    updated_by: item.updated_by,
    deleted_by: item.deleted_by,
    category: (item as any).category_data,
    source: (item as any).source_data,
    type: (item as any).type_data,
    creator: (item as any).creator_data,
  }));

  return {
    message: "Items retrieved successfully",
    items: result,
  };
});
