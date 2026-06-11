import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("reports.andreani", () => {
  it("should list andreani reports", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.andreani.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter andreani reports by priority", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.andreani.byPriority({ priority: "ALTA" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create andreani report", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.andreani.create({
      subject: "Test Email",
      priority: "ALTA",
      summary: "Test summary",
      sender: "test@example.com",
      messageId: `msg-${Date.now()}`,
      receivedAt: new Date(),
    });

    expect(result).toBeDefined();
  });
});

describe("reports.ddt", () => {
  it("should list ddt reports", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.ddt.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter ddt reports by product category", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.ddt.byFilters({
      productCategory: "iPhone",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter ddt reports by sender", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.ddt.byFilters({
      sender: "test",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create ddt report", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reports.ddt.create({
      reportType: "DDT",
      reportNumber: `DDT-${Date.now()}`,
      sender: "Warehouse A",
      recipient: "Store B",
      supplier: "Apple",
      productCategory: "iPhone",
      quantity: 10,
      messageId: `msg-${Date.now()}`,
      receivedAt: new Date(),
    });

    expect(result).toBeDefined();
  });

  it("should validate product categories", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Test all valid categories
    const categories = ["iPhone", "iPad", "MacBook", "Apple Watch"];
    
    for (const category of categories) {
      const result = await caller.reports.ddt.create({
        reportType: "DDT",
        reportNumber: `DDT-${Date.now()}-${category}`,
        productCategory: category as any,
        messageId: `msg-${Date.now()}-${category}`,
        receivedAt: new Date(),
      });
      expect(result).toBeDefined();
    }
  });

  it("should validate priority levels", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const priorities = ["ALTA", "MEDIA", "BASSA"];
    
    for (const priority of priorities) {
      const result = await caller.reports.andreani.create({
        subject: `Test ${priority}`,
        priority: priority as any,
        messageId: `msg-${Date.now()}-${priority}`,
        receivedAt: new Date(),
      });
      expect(result).toBeDefined();
    }
  });
});


describe("reports.statistics", () => {
  it("should get andreani statistics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create some test reports first
    await caller.reports.andreani.create({
      subject: "Test ALTA",
      priority: "ALTA",
      messageId: `msg-${Date.now()}-1`,
      receivedAt: new Date(),
    });

    await caller.reports.andreani.create({
      subject: "Test MEDIA",
      priority: "MEDIA",
      messageId: `msg-${Date.now()}-2`,
      receivedAt: new Date(),
    });

    const stats = await caller.reports.statistics.andreani();
    expect(stats).toBeDefined();
    expect(stats.byPriority).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(2);
  });

  it("should get ddt statistics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create some test DDT reports
    await caller.reports.ddt.create({
      reportType: "DDT",
      reportNumber: `DDT-${Date.now()}-1`,
      productCategory: "iPhone",
      messageId: `msg-${Date.now()}-1`,
      receivedAt: new Date(),
    });

    await caller.reports.ddt.create({
      reportType: "TRASFERIMENTO",
      reportNumber: `DDT-${Date.now()}-2`,
      productCategory: "iPad",
      messageId: `msg-${Date.now()}-2`,
      receivedAt: new Date(),
    });

    const stats = await caller.reports.statistics.ddt();
    expect(stats).toBeDefined();
    expect(stats.byCategory).toBeDefined();
    expect(stats.byType).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(2);
  });

  it("should get trend data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const trend = await caller.reports.statistics.trend({ days: 7 });
    expect(Array.isArray(trend)).toBe(true);
    expect(trend.length).toBeGreaterThan(0);
    
    // Verify structure
    const firstEntry = trend[0];
    expect(firstEntry).toHaveProperty("date");
    expect(firstEntry).toHaveProperty("Andreani");
    expect(firstEntry).toHaveProperty("DDT");
  });
});


describe("invites", () => {
  it("should send invite", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.invites.send({ email: "test@example.com" });
    
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.expiresAt).toBeDefined();
  });

  it("should list invites", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    await caller.invites.send({ email: "user1@example.com" });
    await caller.invites.send({ email: "user2@example.com" });
    
    const invites = await caller.invites.list();
    expect(Array.isArray(invites)).toBe(true);
  });
});

describe("access", () => {
  it("should check user access", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const access = await caller.access.check();
    
    expect(access).toHaveProperty("hasAccess");
    expect(typeof access.hasAccess).toBe("boolean");
  });

  it("should list access users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const users = await caller.access.list();
    
    expect(Array.isArray(users)).toBe(true);
  });
});
