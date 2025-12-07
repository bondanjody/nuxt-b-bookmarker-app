// server/api/type-management/add-new-type.post.ts

import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Type from "../../db/models/type.model"; // pastikan path sesuai
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
  } catch (err) {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

// --------------------------------------------------
// 📌 Main Handler: Add New Type
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login (role bebas)
  const authUser = await authorize(event);

  // Ambil body input
  const body = await readBody(event);
  const { name } = body;

  if (!name || typeof name !== "string") {
    throw createError({
      statusCode: 400,
      message: "Type name is required",
    });
  }

  // Pastikan tipe belum ada untuk user yang sama dan is_active = true
  const existing = await Type.findOne({
    where: {
      name,
      created_by: authUser.username,
      is_active: true,
    },
  });

  if (existing) {
    throw createError({
      statusCode: 409,
      message: "Type already exists for this user",
    });
  }

  // Buat ID manual karena model Type menggunakan UUID
  const { v4: uuidv4 } = await import("uuid");

  // Insert tipe baru
  const newType = await Type.create({
    id: uuidv4(),
    name,
    is_active: true,
    created_at: new Date(),
    created_by: authUser.username,
  });

  return {
    message: "Type created successfully",
    type: {
      id: newType.dataValues.id,
      name: newType.dataValues.name,
      created_by: newType.dataValues.created_by,
      created_at: newType.dataValues.created_at,
    },
  };
});
