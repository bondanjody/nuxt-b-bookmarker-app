import sequelize from "../index";

// import semua init model
import initUserModel, { User, UserRole } from "./user.model";
import initCategoryModel, { Category } from "./category.model";
import initTypeModel, { Type } from "./type.model";
import initSourceModel, { Source } from "./source.model";
import initCreatorModel, { Creator } from "./creator.model";
import initItemModel, { Item } from "./item.model";

// ==========================
// INIT SEMUA MODEL
// ==========================
initUserModel(sequelize);
initCategoryModel(sequelize);
initTypeModel(sequelize);
initSourceModel(sequelize);
initCreatorModel(sequelize);
initItemModel(sequelize);

// ==========================
// RELASI ITEM → MASTER TABLE
// ==========================

// Item → Category
Item.belongsTo(Category, {
  foreignKey: "category",
  as: "category_data",
});

// Item → Type
Item.belongsTo(Type, {
  foreignKey: "type",
  as: "type_data",
});

// Item → Source
Item.belongsTo(Source, {
  foreignKey: "source",
  as: "source_data",
});

// Item → Creator
Item.belongsTo(Creator, {
  foreignKey: "creator",
  as: "creator_data",
});

// ==========================
// RELASI AUDIT TRAIL → USER
// ==========================

// Category
Category.belongsTo(User, { foreignKey: "created_by", as: "creator_user" });
Category.belongsTo(User, { foreignKey: "updated_by", as: "updater_user" });
Category.belongsTo(User, { foreignKey: "deleted_by", as: "deleter_user" });

// Type
Type.belongsTo(User, { foreignKey: "created_by", as: "creator_user" });
Type.belongsTo(User, { foreignKey: "updated_by", as: "updater_user" });
Type.belongsTo(User, { foreignKey: "deleted_by", as: "deleter_user" });

// Source
Source.belongsTo(User, { foreignKey: "created_by", as: "creator_user" });
Source.belongsTo(User, { foreignKey: "updated_by", as: "updater_user" });
Source.belongsTo(User, { foreignKey: "deleted_by", as: "deleter_user" });

// Creator
Creator.belongsTo(User, { foreignKey: "created_by", as: "creator_user" });
Creator.belongsTo(User, { foreignKey: "updated_by", as: "updater_user" });
Creator.belongsTo(User, { foreignKey: "deleted_by", as: "deleter_user" });

// Item
Item.belongsTo(User, { foreignKey: "created_by", as: "creator_user" });
Item.belongsTo(User, { foreignKey: "updated_by", as: "updater_user" });
Item.belongsTo(User, { foreignKey: "deleted_by", as: "deleter_user" });

// ==========================
// EXPORT SEMUA MODEL
// ==========================
export { sequelize, User, Category, Type, Source, Creator, Item };

// ⚠️ Export tipe UserRole agar bisa dipakai di controller
export type { UserRole };
