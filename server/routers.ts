import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  reports: router({
    // Andreani Reports
    andreani: router({
      list: protectedProcedure
        .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
        .query(({ ctx, input }) => db.getAndreaniReports(ctx.user.id, input.limit, input.offset)),
      
      byPriority: protectedProcedure
        .input(z.object({ priority: z.enum(["ALTA", "MEDIA", "BASSA"]) }))
        .query(({ ctx, input }) => db.getAndreaniReportsByPriority(ctx.user.id, input.priority)),
      
      uniqueSenders: protectedProcedure
        .query(({ ctx }) => db.getUniqueSenders(ctx.user.id)),
      
      bySender: protectedProcedure
        .input(z.object({ sender: z.string(), limit: z.number().optional(), offset: z.number().optional() }))
        .query(({ ctx, input }) => db.getAndreaniReportsBySender(ctx.user.id, input.sender, input.limit, input.offset)),
      
      bySenderAndPriority: protectedProcedure
        .input(z.object({ sender: z.string(), priority: z.enum(["ALTA", "MEDIA", "BASSA"]) }))
        .query(({ ctx, input }) => db.getAndreaniReportsBySenderAndPriority(ctx.user.id, input.sender, input.priority)),
      
      create: protectedProcedure
        .input(z.object({
          subject: z.string(),
          priority: z.enum(["ALTA", "MEDIA", "BASSA"]),
          summary: z.string().optional(),
          sender: z.string().optional(),
          messageId: z.string().optional(),
          receivedAt: z.date(),
        }))
        .mutation(async ({ ctx, input }) => {
          const report = await db.createAndreaniReport(ctx.user.id, input);
          
          // Create notification for high priority emails
          if (input.priority === "ALTA") {
            await db.createNotification({
              userId: ctx.user.id,
              title: `Email ALTA Priorità da ${input.sender || "Fabio Andreani"}`,
              message: input.subject,
              type: "high_priority_email",
              reportType: "andreani",
            });
          }
          
          return report;
        }),
    }),
    
    // DDT Reports
    ddt: router({
      list: protectedProcedure
        .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
        .query(({ ctx, input }) => db.getDdtReports(ctx.user.id, input.limit, input.offset)),
      
      byFilters: protectedProcedure
        .input(z.object({
          productCategory: z.string().optional(),
          sender: z.string().optional(),
          recipient: z.string().optional(),
          supplier: z.string().optional(),
        }))
        .query(({ ctx, input }) => db.getDdtReportsByFilters(ctx.user.id, input)),
      
      create: protectedProcedure
        .input(z.object({
          reportType: z.enum(["DDT", "TRASFERIMENTO"]),
          reportNumber: z.string(),
          sender: z.string().optional(),
          recipient: z.string().optional(),
          supplier: z.string().optional(),
          productCategory: z.enum(["iPhone", "iPad", "MacBook", "Apple Watch"]),
          quantity: z.number().optional(),
          details: z.string().optional(),
          messageId: z.string().optional(),
          receivedAt: z.date(),
        }))
        .mutation(({ ctx, input }) => db.createDdtReport(ctx.user.id, input)),
    }),

    // Statistics
    statistics: router({
      andreani: protectedProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(({ ctx, input }) => db.getAndreaniStatistics(ctx.user.id, input.days)),
      
      ddt: protectedProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(({ ctx, input }) => db.getDdtStatistics(ctx.user.id, input.days)),
      
      trend: protectedProcedure
        .input(z.object({ days: z.number().default(30) }))
        .query(({ ctx, input }) => db.getReportsTrendData(ctx.user.id, input.days)),
    }),
  }),

  invites: router({
    send: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const token = nanoid(32);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await db.createInvite(ctx.user.id, input.email, token, expiresAt);
        
        return {
          success: true,
          token,
          expiresAt,
        };
      }),
    
    list: protectedProcedure
      .query(({ ctx }) => db.getInvitesByUser(ctx.user.id)),
    
    accept: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error("Must be logged in to accept invite");
        }
        
        const success = await db.acceptInvite(input.token, ctx.user.id);
        return { success };
      }),
  }),

  access: router({
    check: protectedProcedure
      .query(async ({ ctx }) => {
        const hasAccess = await db.checkUserAccess(ctx.user.id);
        return { hasAccess };
      }),
    
    list: protectedProcedure
      .query(({ ctx }) => db.getAccessUsers(ctx.user.id)),
  }),

  notifications: router({
    unread: protectedProcedure
      .query(({ ctx }) => db.getUnreadNotifications(ctx.user.id)),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(({ ctx, input }) => db.getAllNotifications(ctx.user.id, input.limit, input.offset)),
    
    count: protectedProcedure
      .query(({ ctx }) => db.getUnreadNotificationCount(ctx.user.id)),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(({ input }) => db.markNotificationAsRead(input.notificationId)),
    
    markAllAsRead: protectedProcedure
      .mutation(({ ctx }) => db.markAllNotificationsAsRead(ctx.user.id)),
    
    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(({ input }) => db.deleteNotification(input.notificationId)),
  }),


});

export type AppRouter = typeof appRouter;
