// server/api/source-management/get-source-by-user.get.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Source from "~~/server/db/models/source.model";

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
// 📌 Main Handler: Get Source By User
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login
  const authUser = await authorize(event);

  // Cari sumber berdasarkan user yang login (created_by)
  const sources = await Source.findAll({
    where: {
      created_by: authUser.username, // Menyaring sumber berdasarkan user yang membuatnya
      is_active: true, // Hanya sumber yang aktif
    },
  });

  if (sources.length === 0) {
    throw createError({
      statusCode: 404,
      message: "No sources found for this user",
    });
  }

  // Kembalikan data sumber
  return {
    message: "Sources fetched successfully",
    sources: sources.map((source) => ({
      id: source.dataValues.id,
      name: source.dataValues.name,
      link: source.dataValues.link,
      created_by: source.dataValues.created_by,
      created_at: source.dataValues.created_at,
      is_active: source.dataValues.is_active,
    })),
  };
});
