// server/api/creator-management/get-creator-by-user.get.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Creator from "~~/server/db/models/creator.model";
import { UserRole } from "~~/server/db/models/user.model";

// Helper: Validasi JWT (semua role diperbolehkan)
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

// Main Handler: Get Creator by User
export default defineEventHandler(async (event) => {
  // Pastikan pengguna sudah login (role bebas)
  const authUser = await authorize(event);
  const { username } = authUser;

  // Ambil data creator berdasarkan username
  const creators = await Creator.findAll({
    where: {
      created_by: username,
      is_active: true,
    },
  });

  if (!creators || creators.length === 0) {
    throw createError({
      statusCode: 404,
      message: "No creators found for the current user",
    });
  }

  // Format hasil yang dikembalikan
  return {
    message: "Creators retrieved successfully",
    creators: creators.map((creator) => ({
      id: creator.dataValues.id,
      name: creator.dataValues.name,
      link: creator.dataValues.link,
      is_active: creator.dataValues.is_active,
      created_at: creator.dataValues.created_at,
      updated_at: creator.dataValues.updated_at,
    })),
  };
});
