import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { processUrl } from "../services/urlProcessor";
import { cartItem } from "@The-Cart/db";
import { eq, desc } from "drizzle-orm";
import { db } from "@The-Cart/db";
import { env } from "@The-Cart/env/server";

export const cartRouter = router({
  create: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      // Process the URL
      const result = await processUrl(input.url, env.CEREBRAS_API_KEY);

      // Generate unique ID
      const id = crypto.randomUUID();

      // Insert into database
      const [item] = await db
        .insert(cartItem)
        .values({
          id,
          userId: ctx.session.user.id,
          url: result.url,
          source: result.source,
          title: result.extractedData.title,
          description: result.extractedData.description,
          price: result.extractedData.price || null,
          currency: result.extractedData.currency || null,
          imageUrl: result.extractedData.imageUrl || null,
          brand: result.extractedData.brand || null,
          category: result.extractedData.category || null,
          markdownContent: result.markdownContent,
          aiConfidence: result.extractedData.confidence,
          status: "saved",
          priority: "medium",
          tags: [],
        })
        .returning();

      return {
        success: true,
        item,
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await db
      .select()
      .from(cartItem)
      .where(eq(cartItem.userId, ctx.session.user.id))
      .orderBy(desc(cartItem.createdAt));

    return items;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [item] = await db
        .select()
        .from(cartItem)
        .where(eq(cartItem.id, input.id))
        .limit(1);

      if (!item) {
        return null;
      }

      // Ensure user owns this item
      if (item.userId !== ctx.session.user.id) {
        return null;
      }

      return item;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // First verify ownership
      const [existingItem] = await db
        .select()
        .from(cartItem)
        .where(eq(cartItem.id, input.id))
        .limit(1);

      if (!existingItem || existingItem.userId !== ctx.session.user.id) {
        throw new Error("Item not found or access denied");
      }

      await db.delete(cartItem).where(eq(cartItem.id, input.id));

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["saved", "purchased", "archived"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const [existingItem] = await db
        .select()
        .from(cartItem)
        .where(eq(cartItem.id, input.id))
        .limit(1);

      if (!existingItem || existingItem.userId !== ctx.session.user.id) {
        throw new Error("Item not found or access denied");
      }

      const [item] = await db
        .update(cartItem)
        .set({ status: input.status })
        .where(eq(cartItem.id, input.id))
        .returning();

      return { success: true, item };
    }),

  updatePriority: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        priority: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const [existingItem] = await db
        .select()
        .from(cartItem)
        .where(eq(cartItem.id, input.id))
        .limit(1);

      if (!existingItem || existingItem.userId !== ctx.session.user.id) {
        throw new Error("Item not found or access denied");
      }

      const [item] = await db
        .update(cartItem)
        .set({ priority: input.priority })
        .where(eq(cartItem.id, input.id))
        .returning();

      return { success: true, item };
    }),

  addTags: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const [existingItem] = await db
        .select()
        .from(cartItem)
        .where(eq(cartItem.id, input.id))
        .limit(1);

      if (!existingItem || existingItem.userId !== ctx.session.user.id) {
        throw new Error("Item not found or access denied");
      }

      const currentTags = existingItem.tags || [];
      const newTags = [...new Set([...currentTags, ...input.tags])];

      const [item] = await db
        .update(cartItem)
        .set({ tags: newTags })
        .where(eq(cartItem.id, input.id))
        .returning();

      return { success: true, item };
    }),
});

export type CartRouter = typeof cartRouter;
