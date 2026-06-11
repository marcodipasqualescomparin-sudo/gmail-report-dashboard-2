import { eq, desc, and, like, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, andreaniReports, ddtReports, invites, accesses, notifications, InsertAndreaniReport, InsertDdtReport, InsertInvite, InsertAccess, InsertNotification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Andreani Reports Queries
export async function getAndreaniReports(userId: number, limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select()
    .from(andreaniReports)
    .where(eq(andreaniReports.userId, userId))
    .orderBy(desc(andreaniReports.receivedAt));

  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);

  return query;
}

export async function getAndreaniReportsByPriority(userId: number, priority: 'ALTA' | 'MEDIA' | 'BASSA') {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(andreaniReports)
    .where(and(
      eq(andreaniReports.userId, userId),
      eq(andreaniReports.priority, priority)
    ))
    .orderBy(desc(andreaniReports.receivedAt));
}

export async function createAndreaniReport(userId: number, data: Omit<InsertAndreaniReport, 'userId'>) {
  const db = await getDb();
  if (!db) return null;

  const report = {
    ...data,
    userId,
  } as InsertAndreaniReport;

  await db.insert(andreaniReports).values(report);
  return report;
}

// DDT Reports Queries
export async function getDdtReports(userId: number, limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select()
    .from(ddtReports)
    .where(eq(ddtReports.userId, userId))
    .orderBy(desc(ddtReports.receivedAt));

  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);

  return query;
}

export async function getDdtReportsByCategory(userId: number, category: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(ddtReports)
    .where(and(
      eq(ddtReports.userId, userId),
      eq(ddtReports.productCategory, category)
    ))
    .orderBy(desc(ddtReports.receivedAt));
}

export async function getDdtReportsByFilters(
  userId: number,
  filters: { sender?: string; recipient?: string; supplier?: string; productCategory?: string; limit?: number; offset?: number }
) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(ddtReports.userId, userId)];

  if (filters.sender) {
    conditions.push(eq(ddtReports.sender, filters.sender));
  }
  if (filters.recipient) {
    conditions.push(eq(ddtReports.recipient, filters.recipient));
  }
  if (filters.supplier) {
    conditions.push(eq(ddtReports.supplier, filters.supplier));
  }
  if (filters.productCategory) {
    conditions.push(eq(ddtReports.productCategory, filters.productCategory));
  }

  let query = db.select()
    .from(ddtReports)
    .where(and(...conditions))
    .orderBy(desc(ddtReports.receivedAt));

  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

export async function createDdtReport(userId: number, data: Omit<InsertDdtReport, 'userId'>) {
  const db = await getDb();
  if (!db) return null;

  const report = {
    ...data,
    userId,
  } as InsertDdtReport;

  await db.insert(ddtReports).values(report);
  return report;
}


// Statistics Queries
export async function getAndreaniStatistics(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return { byPriority: {}, total: 0 };
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const reports = await db.select()
    .from(andreaniReports)
    .where(and(
      eq(andreaniReports.userId, userId),
      gte(andreaniReports.receivedAt, cutoffDate)
    ));
  
  const byPriority = {
    ALTA: reports.filter(r => r.priority === 'ALTA').length,
    MEDIA: reports.filter(r => r.priority === 'MEDIA').length,
    BASSA: reports.filter(r => r.priority === 'BASSA').length,
  };
  
  return {
    byPriority,
    total: reports.length,
  };
}

export async function getDdtStatistics(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return { byCategory: {}, byType: {}, total: 0 };
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const reports = await db.select()
    .from(ddtReports)
    .where(and(
      eq(ddtReports.userId, userId),
      gte(ddtReports.receivedAt, cutoffDate)
    ));
  
  const byCategory = {
    'iPhone': reports.filter(r => r.productCategory === 'iPhone').length,
    'iPad': reports.filter(r => r.productCategory === 'iPad').length,
    'MacBook': reports.filter(r => r.productCategory === 'MacBook').length,
    'Apple Watch': reports.filter(r => r.productCategory === 'Apple Watch').length,
  };
  
  const byType = {
    'DDT': reports.filter(r => r.reportType === 'DDT').length,
    'TRASFERIMENTO': reports.filter(r => r.reportType === 'TRASFERIMENTO').length,
  };
  
  return {
    byCategory,
    byType,
    total: reports.length,
  };
}

export async function getReportsTrendData(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return { data: [] };

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const andreaniReports_ = await db.select()
    .from(andreaniReports)
    .where(and(
      eq(andreaniReports.userId, userId),
      gte(andreaniReports.receivedAt, cutoffDate)
    ));

  const ddtReports_ = await db.select()
    .from(ddtReports)
    .where(and(
      eq(ddtReports.userId, userId),
      gte(ddtReports.receivedAt, cutoffDate)
    ));

  const dateMap = new Map<string, { andreani: number; ddt: number }>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, { andreani: 0, ddt: 0 });
  }

  andreaniReports_.forEach(report => {
    const dateStr = report.receivedAt.toISOString().split('T')[0];
    const entry = dateMap.get(dateStr);
    if (entry) entry.andreani++;
  });

  ddtReports_.forEach(report => {
    const dateStr = report.receivedAt.toISOString().split('T')[0];
    const entry = dateMap.get(dateStr);
    if (entry) entry.ddt++;
  });

  const data = Array.from(dateMap.entries())
    .reverse()
    .map(([date, counts]) => ({
      date,
      andreani: counts.andreani,
      ddt: counts.ddt,
    }));

  return { data };
}

// Invites Queries
export async function createInvite(userId: number, email: string, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) return null;

  const invite = {
    userId,
    email,
    token,
    expiresAt,
  };

  await db.insert(invites).values(invite);
  return invite;
}

export async function getInvitesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(invites)
    .where(eq(invites.userId, userId))
    .orderBy(desc(invites.createdAt));
}

export async function acceptInvite(token: string, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const invite = await db.select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (invite.length === 0 || invite[0].expiresAt < new Date()) {
    return false;
  }

  await db.insert(accesses).values({
    userId,
    ownerId: invite[0].userId,
    permission: 'view_export',
  });

  return true;
}

// Access Queries
export async function checkUserAccess(userId: number) {
  const db = await getDb();
  if (!db) return false;

  const access = await db.select()
    .from(accesses)
    .where(eq(accesses.userId, userId))
    .limit(1);

  return access.length > 0;
}

export async function getAccessUsers(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(accesses)
    .where(eq(accesses.ownerId, userId));
}

// Notifications Queries
export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0)
    ))
    .orderBy(desc(notifications.createdAt));
}

export async function getAllNotifications(userId: number, limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);

  return query;
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(notifications).values(data);
  return data;
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0)
    ));

  return result.length;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.id, notificationId));

  return true;
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.userId, userId));

  return true;
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(notifications)
    .where(eq(notifications.id, notificationId));

  return true;
}


export async function getUniqueSenders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const reports = await db.select()
    .from(andreaniReports)
    .where(eq(andreaniReports.userId, userId));

  const uniqueSenders = Array.from(new Set(reports.map(r => r.sender).filter(Boolean)));
  return uniqueSenders.sort();
}

export async function getAndreaniReportsBySender(userId: number, sender: string, limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select()
    .from(andreaniReports)
    .where(and(
      eq(andreaniReports.userId, userId),
      eq(andreaniReports.sender, sender)
    ))
    .orderBy(desc(andreaniReports.receivedAt));

  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);

  return query;
}

export async function getAndreaniReportsBySenderAndPriority(userId: number, sender: string, priority: 'ALTA' | 'MEDIA' | 'BASSA') {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(andreaniReports)
    .where(and(
      eq(andreaniReports.userId, userId),
      eq(andreaniReports.sender, sender),
      eq(andreaniReports.priority, priority)
    ))
    .orderBy(desc(andreaniReports.receivedAt));
}



