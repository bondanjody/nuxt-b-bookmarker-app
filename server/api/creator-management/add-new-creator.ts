// server/api/creator-management/add-new-creator.post.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Creator from "~~/server/db/models/creator.model";

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

    if (!username) {
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    }

    return { username };
  } catch (err) {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

// --------------------------------------------------
// 📌 Main Handler: Add New Creator
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login (role bebas)
  const authUser = await authorize(event);

  // Coba menangani body request dengan cara yang lebih eksplisit
  let body;
  try {
    body = await readBody(event);
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: "Invalid JSON body",
    });
  }

  const { name, link } = body;

  if (!name || typeof name !== "string") {
    throw createError({
      statusCode: 400,
      message: "Creator name is required",
    });
  }
  if (!link || typeof link !== "string") {
    throw createError({
      statusCode: 400,
      message: "Creator link is required",
    });
  }

  // Pastikan creator belum ada untuk user yang sama dan is_active = true
  const existing = await Creator.findOne({
    where: {
      name,
      link,
      created_by: authUser.username,
      is_active: true,
    },
  });

  if (existing) {
    throw createError({
      statusCode: 409,
      message: "Creator already exists for this user",
    });
  }

  // Buat ID manual karena model Creator menggunakan UUID
  const { v4: uuidv4 } = await import("uuid");

  // Insert tipe baru
  const newCreator = await Creator.create({
    id: uuidv4(),
    name,
    link,
    is_active: true,
    created_at: new Date(),
    created_by: authUser.username,
  });

  return {
    message: "Creator created successfully",
    creator: {
      id: newCreator.dataValues.id,
      name: newCreator.dataValues.name,
      link: newCreator.dataValues.link,
      created_by: newCreator.dataValues.created_by,
      created_at: newCreator.dataValues.created_at,
    },
  };
});
