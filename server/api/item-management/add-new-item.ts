import { H3Event } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken";
import Category from "../../db/models/category.model";
import Source from "../../db/models/source.model";
import Type from "../../db/models/type.model";
import Creator from "../../db/models/creator.model"; // Import model creator
import Item from "../../db/models/item.model";

// Helper untuk validasi JWT dan mengautentikasi user
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

// Function to generate a unique UUID
async function generateUniqueId() {
  const { v4: uuidv4 } = await import("uuid");

  let uniqueId = uuidv4();
  let itemExists = await Item.findOne({
    where: { id: uniqueId },
  });

  while (itemExists) {
    uniqueId = uuidv4();
    itemExists = await Item.findOne({
      where: { id: uniqueId },
    });
  }

  return uniqueId;
}

// Main handler untuk menambahkan item baru
export default defineEventHandler(async (event) => {
  // 1. User harus login
  const authUser = await authorize(event);

  // 2. Ambil body input
  const body = await readBody(event);
  const { title, link, notes, category, source, type, creator } = body;

  if (!title || !link || !notes || !category || !source || !type || !creator) {
    throw createError({
      statusCode: 400,
      message:
        "Title, link, notes, category, source, type, and creator are required",
    });
  }

  // 3. Validasi category, source, type, creator
  const [categoryRecord, sourceRecord, typeRecord, creatorRecord] =
    await Promise.all([
      Category.findOne({
        where: {
          id: category,
          is_active: true,
          created_by: authUser.username,
        },
      }),
      Source.findOne({
        where: {
          id: source,
          is_active: true,
          created_by: authUser.username,
        },
      }),
      Type.findOne({
        where: {
          id: type,
          is_active: true,
          created_by: authUser.username,
        },
      }),
      Creator.findOne({
        where: {
          id: creator,
          is_active: true,
          created_by: authUser.username,
        },
      }),
    ]);

  if (!categoryRecord) {
    throw createError({
      statusCode: 404,
      message: "Category not found or inactive, or does not belong to the user",
    });
  }

  if (!sourceRecord) {
    throw createError({
      statusCode: 404,
      message: "Source not found or inactive, or does not belong to the user",
    });
  }

  if (!typeRecord) {
    throw createError({
      statusCode: 404,
      message: "Type not found or inactive, or does not belong to the user",
    });
  }

  if (!creatorRecord) {
    throw createError({
      statusCode: 404,
      message: "Creator not found or inactive, or does not belong to the user",
    });
  }

  // 5. Validasi Duplikasi Item berdasarkan title, link, category, source, type, creator
  const existingItem = await Item.findOne({
    where: {
      title,
      link,
      category,
      source,
      type,
      is_active: true, // Pastikan hanya item yang aktif yang diperiksa
    },
  });

  if (existingItem) {
    throw createError({
      statusCode: 409,
      message:
        "An item with the same title, link, category, source, and type already exists",
    });
  }

  // 6. Generate unique UUID untuk ID baru
  const newItemId = await generateUniqueId();

  // 7. Tambahkan item baru ke database
  const newItem = await Item.create({
    id: newItemId,
    title,
    link,
    is_done: false,
    notes,
    category,
    source,
    type,
    creator,
    is_active: true,
    created_at: new Date(),
    created_by: authUser.username, // Created by user yang login
  });

  return {
    message: "Item created successfully",
    item: {
      id: newItem.dataValues.id,
      title: newItem.dataValues.title,
      link: newItem.dataValues.link,
      notes: newItem.dataValues.notes,
      category: newItem.dataValues.category,
      source: newItem.dataValues.source,
      type: newItem.dataValues.type,
      creator: newItem.dataValues.creator,
      is_active: newItem.dataValues.is_active,
      created_at: newItem.dataValues.created_at,
    },
  };
});
