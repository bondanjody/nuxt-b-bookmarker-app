import User from "../../db/models/user.model";
import bcrypt from "bcrypt";
import jwt, { SignOptions, Secret } from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: "Username and password are required",
    });
  }

  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Invalid username or password",
    });
  }

  // Ambil nilai dari dataValues
  const {
    password: hashedPassword,
    username: storedUsername,
    role: storedRole,
  } = user.dataValues;

  const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

  if (!isPasswordMatch) {
    throw createError({
      statusCode: 401,
      message: "Invalid username or password",
    });
  }

  const config = useRuntimeConfig();

  // ✅ Casting secret ke jwt.Secret agar TypeScript tidak error
  const secret: Secret = config.jwtSecret;

  const signOptions: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };

  // ✅ Generate JWT
  const token = jwt.sign(
    {
      username: user.username,
      role: user.role,
    },
    secret,
    signOptions
  );

  return {
    message: "Login success",
    token,
    user: {
      username: storedUsername,
      role: storedRole,
    },
  };
});
