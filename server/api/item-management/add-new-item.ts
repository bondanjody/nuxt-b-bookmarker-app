import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  Category,
  Source,
  Type,
  Creator,
  Item,
  UserRole,
} from "../../db/models";
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
    const role = decoded?.role as UserRole | undefined;
    if (!username || !role)
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    return { username, role };
  } catch {
    throw createError({ statusCode: 401, message: "Invalid or expired token" });
  }
}

export default defineEventHandler(async (event) => {
  const authUser = await authorize(event);

  const body = await readBody(event);
  const { title, link, notes, category, source, type, creator } = body;

  if (!title || !link || !notes || !category || !source || !type || !creator) {
    throw createError({ statusCode: 400, message: "All fields are required" });
  }

  // Validasi relasi (hanya item aktif)
  const [categoryRecord, sourceRecord, typeRecord, creatorRecord] =
    await Promise.all([
      Category.findOne({ where: { id: category, is_active: true } }),
      Source.findOne({ where: { id: source, is_active: true } }),
      Type.findOne({ where: { id: type, is_active: true } }),
      Creator.findOne({ where: { id: creator, is_active: true } }),
    ]);

  if (!categoryRecord)
    throw createError({
      statusCode: 404,
      message: "Category not found or inactive",
    });
  if (!sourceRecord)
    throw createError({
      statusCode: 404,
      message: "Source not found or inactive",
    });
  if (!typeRecord)
    throw createError({
      statusCode: 404,
      message: "Type not found or inactive",
    });
  if (!creatorRecord)
    throw createError({
      statusCode: 404,
      message: "Creator not found or inactive",
    });

  // Validasi duplikasi
  const existingItem = await Item.findOne({
    where: { title, link, category, source, type, creator, is_active: true },
  });
  if (existingItem)
    throw createError({ statusCode: 409, message: "Item already exists" });

  // Tambah item
  const newItem = await Item.create({
    id: uuidv4(),
    title,
    link,
    notes,
    category,
    source,
    type,
    creator,
    is_done: false,
    is_active: true,
    created_at: new Date(),
    created_by: authUser.username,
  });

  return {
    status: true,
    message: "Item created successfully",
    data: {
      id: newItem.dataValues.id,
      title: newItem.dataValues.title,
      link: newItem.dataValues.link,
      notes: newItem.dataValues.notes,
      category: newItem.dataValues.category,
      source: newItem.dataValues.source,
      type: newItem.dataValues.type,
      creator: newItem.dataValues.creator,
      is_done: newItem.dataValues.is_done,
      is_active: newItem.dataValues.is_active,
      created_at: newItem.dataValues.created_at,
      created_by: newItem.dataValues.created_by,
    },
  };
});
