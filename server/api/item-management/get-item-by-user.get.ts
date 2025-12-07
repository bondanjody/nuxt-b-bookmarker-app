// server/api/item-management/get-item-by-user.get.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
// import Item from "~~/server/db/models/item.model";
import Item from "~~/server/db/models/item.model";
import Category from "~~/server/db/models/category.model";
import Source from "~~/server/db/models/source.model";
import Type from "~~/server/db/models/type.model";
import Creator from "~~/server/db/models/creator.model";
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
  } catch (err) {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

// --------------------------------------------------
// 📌 Main Handler: Get Item by User
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login (role bebas)
  const authUser = await authorize(event);

  const { username } = authUser;

  // Ambil item yang dibuat oleh user berdasarkan username
  const items = await Item.findAll({
    where: {
      created_by: username,
      is_active: true,
    },
    include: [
      {
        model: Category,
        as: "categoryDetails", // alias untuk Category
        attributes: ["id", "name", "is_active"],
      },
      {
        model: Source,
        as: "sourceDetails", // alias untuk Source
        attributes: ["id", "name", "link", "is_active"],
      },
      {
        model: Type,
        as: "typeDetails", // alias untuk Type
        attributes: ["id", "name", "is_active"],
      },
      {
        model: Creator,
        as: "creatorDetails", // alias untuk Creator
        attributes: ["id", "name", "link", "is_active"],
      },
    ],
  });

  // Jika tidak ada item ditemukan
  if (!items || items.length === 0) {
    throw createError({
      statusCode: 404,
      message: "No items found for the current user",
    });
  }

  console.log("Nilai item : ", items);

  // Mengubah data response sesuai kebutuhan
  const result = items.map((item) => ({
    id: item.id,
    title: item.title,
    link: item.link,
    is_done: item.is_done,
    notes: item.notes,
    created_at: item.created_at,
    updated_at: item.updated_at,
    is_active: item.is_active,
    created_by: item.created_by,
    updated_by: item.updated_by,
    deleted_by: item.deleted_by,
    category: item.categoryDetails,
    source: item.sourceDetails,
    type: item.typeDetails,
    creator: item.creatorDetails,
  }));

  return {
    message: "Items retrieved successfully",
    items: result,
  };
});
