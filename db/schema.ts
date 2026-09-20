import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  occupation: text("occupation").notNull(),
  locale: text("locale").notNull().default("tr"),
  cvKey: text("cv_key").notNull(),
  cvName: text("cv_name").notNull(),
  cvType: text("cv_type").notNull(),
  cvSize: integer("cv_size").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    jobTitle: text("job_title").notNull(),
    country: text("country").notNull(),
    profession: text("profession").notNull(),
    message: text("message").notNull().default(""),
    cvKey: text("cv_key").notNull(),
    cvName: text("cv_name").notNull(),
    cvType: text("cv_type").notNull(),
    cvSize: integer("cv_size").notNull(),
    status: text("status").notNull().default("received"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_applications_user_created").on(table.userId, table.createdAt)],
);
