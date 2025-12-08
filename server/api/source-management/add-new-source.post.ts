import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Source, UserRole } from "../../db/models";
import { v4 as uuidv4 } from "uuid";

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
// 📌 Main Handler: Add New Source
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login (role bebas)
  const authUser = await authorize(event);

  // Ambil body input
  const body = await readBody(event);
  const { name, link } = body;

  if (!name || typeof name !== "string" || !link || typeof link !== "string") {
    throw createError({
      statusCode: 400,
      message: "Source name and link are required",
    });
  }

  // --------------------------------------------------
  // 🔍 Validasi source sudah ada untuk user
  // --------------------------------------------------
  const existing = await Source.findOne({
    where: {
      name,
      created_by: authUser.username,
      is_active: true,
    },
  });

  if (existing) {
    throw createError({
      statusCode: 409,
      message: "You already have an active source with this name",
    });
  }

  // --------------------------------------------------
  // ✅ Insert source baru
  // --------------------------------------------------
  const newSource = await Source.create({
    id: uuidv4(),
    name,
    link,
    is_active: true,
    created_at: new Date(),
    created_by: authUser.username,
  });

  return {
    status: true,
    message: "Source created successfully",
    data: {
      id: newSource.dataValues.id,
      name: newSource.dataValues.name,
      link: newSource.dataValues.link,
      created_by: newSource.dataValues.created_by,
      created_at: newSource.dataValues.created_at,
    },
  };
});
