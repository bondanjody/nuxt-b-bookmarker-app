import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Creator, User } from "~~/server/db/models";
import { v4 as uuidv4 } from "uuid";

// 🔐 Helper JWT
async function authorize(event: H3Event) {
  const authHeader = event.node.req.headers.authorization;
  if (!authHeader)
    throw createError({
      statusCode: 401,
      message: "Authorization header missing",
    });

  const token = authHeader.split(" ")[1];
  if (!token)
    throw createError({ statusCode: 401, message: "Token not provided" });

  const config = useRuntimeConfig();
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const username = decoded?.username;
    const role = decoded?.role;
    if (!username || !role)
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    return { username, role };
  } catch {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

// 📌 Handler: Add New Creator
export default defineEventHandler(async (event) => {
  const authUser = await authorize(event);

  let body;
  try {
    body = await readBody(event);
  } catch {
    throw createError({ statusCode: 400, message: "Invalid JSON body" });
  }

  const { name, link } = body;

  if (!name || typeof name !== "string")
    throw createError({ statusCode: 400, message: "Creator name is required" });
  if (!link || typeof link !== "string")
    throw createError({ statusCode: 400, message: "Creator link is required" });

  // Pastikan creator unik untuk user dan aktif
  const existing = await Creator.findOne({
    where: { name, link, created_by: authUser.username, is_active: true },
  });

  if (existing)
    throw createError({
      statusCode: 409,
      message: "Creator already exists for this user",
    });

  // Tambahkan creator baru
  const newCreator = await Creator.create({
    id: uuidv4(),
    name,
    link,
    is_active: true,
    created_at: new Date(),
    created_by: authUser.username,
  });

  return {
    status: true,
    message: "Creator created successfully",
    data: {
      id: newCreator.dataValues.id,
      name: newCreator.dataValues.name,
      link: newCreator.dataValues.link,
      created_by: newCreator.dataValues.created_by,
      created_at: newCreator.dataValues.created_at,
    },
  };
});
