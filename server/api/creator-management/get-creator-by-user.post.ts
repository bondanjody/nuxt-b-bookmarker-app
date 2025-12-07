import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Creator from "~~/server/db/models/creator.model";

// --------------------------------------------------
// 🔐 Helper: Validasi JWT dan ambil username
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
// 📌 Main Handler: Get Creator by User (username from token)
// --------------------------------------------------
export default defineEventHandler(async (event) => {
  // 🔒 User harus login (role bebas)
  const authUser = await authorize(event);

  // Ambil data creator berdasarkan username yang ada di token
  const creators = await Creator.findAll({
    where: {
      created_by: authUser.username,
      is_active: true, // Hanya yang aktif
    },
  });

  if (creators.length === 0) {
    return {
      message: "No creators found for this user.",
      creators: [],
    };
  }

  return {
    message: "Creators fetched successfully",
    creators: creators.map((creator) => ({
      id: creator.dataValues.id,
      name: creator.dataValues.name,
      link: creator.dataValues.link,
      created_at: creator.dataValues.created_at,
      created_by: creator.dataValues.created_by,
    })),
  };
});
