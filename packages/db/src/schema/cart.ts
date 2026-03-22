import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, jsonb, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const cartItem = pgTable(
  "cart_item",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    source: text("source").notNull(),
    
    // Extracted by AI
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: text("price"),
    currency: text("currency"),
    imageUrl: text("image_url"),
    brand: text("brand"),
    category: text("category"),
    
    // Raw data
    markdownContent: text("markdown_content").notNull(),
    aiConfidence: integer("ai_confidence"),
    
    // User additions
    notes: text("notes"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    priority: text("priority").default("medium").notNull(), // 'low' | 'medium' | 'high'
    status: text("status").default("saved").notNull(), // 'saved' | 'purchased' | 'archived'
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("cart_item_userId_idx").on(table.userId),
    index("cart_item_status_idx").on(table.status),
    index("cart_item_createdAt_idx").on(table.createdAt),
  ],
);

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  user: one(user, {
    fields: [cartItem.userId],
    references: [user.id],
  }),
}));
