import { User } from "../../db/models"; // ✅ IMPORT DARI MODELS INDEX
import type { UserRole } from "../../db/models/user.model";
import bcrypt from "bcrypt";
import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";

// Helper untuk cek role user dari JWT
async function authorize(event: H3Event, allowedRoles: UserRole[]) {
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

    // Ambil username dan role dari decoded
    const username =
      typeof decoded === "object" && "username" in decoded
        ? decoded.username
        : undefined;
    const role =
      typeof decoded === "object" && "role" in decoded
        ? decoded.role
        : undefined;

    if (!username || !role) {
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    }

    if (!allowedRoles.includes(role as UserRole)) {
      throw createError({
        statusCode: 403,
        message: "Forbidden: insufficient role",
      });
    }

    return { username, role: role as UserRole };
  } catch (err) {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

export default defineEventHandler(async (event) => {
  // 🔒 Hanya SUPERADMIN
  await authorize(event, ["B.BM.SUPERADMIN"]);

  // Ambil body
  const body = await readBody(event);
  const { username, password, role } = body;

  // Validasi input
  if (!username || !password || !role) {
    throw createError({
      statusCode: 400,
      message: "username, password, and role are required",
    });
  }

  // Pastikan role valid
  const validRoles: UserRole[] = ["B.BM.SUPERADMIN", "B.BM.ADMIN", "B.BM.USER"];
  if (!validRoles.includes(role)) {
    throw createError({
      statusCode: 400,
      message: `Invalid role. Must be one of ${validRoles.join(", ")}`,
    });
  }

  // Cek apakah username sudah ada
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw createError({ statusCode: 409, message: "Username already exists" });
  }

  // Hash password
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Buat user baru
  const newUser = await User.create({
    username,
    password: hashedPassword,
    role,
    is_active: true,
    created_at: new Date(),
  });

  return {
    message: "User created successfully",
    user: {
      username: username,
      role: role,
      is_active: newUser.is_active,
    },
  };
});
