import { protectedProcedure, publicProcedure, router } from "../index";
import { cartRouter } from "./cart";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  cart: cartRouter,
});
export type AppRouter = typeof appRouter;
