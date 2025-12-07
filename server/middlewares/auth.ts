import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const protectedRoutes = [
    "/api/protected",
    "/api/bookmark/create",
    "/api/bookmark/delete",
    // tambahkan rute private lain
  ];

  const url = event.node.req.url || "";

  // Jika bukan route yang dilindungi, lanjut
  if (!protectedRoutes.some(r => url.startsWith(r))) {
    return;
  }

  const authHeader = event.node.req.headers.authorization;

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: "Missing Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  const config = useRuntimeConfig();

  try {
    const decoded: any = jwt.verify(token, config.jwtSecret);

    event.context.user = decoded;
  } catch (err) {
    throw createError({
      statusCode: 401,
      message: "Invalid or expired token",
    });
  }
});
