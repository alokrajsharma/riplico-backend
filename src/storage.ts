import { users, emails, agreements, type User, type InsertUser, type Email, type InsertEmail, type Agreement, type InsertAgreement } from "./shared/schema.js";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveEmail(email: InsertEmail): Promise<Email>;
  saveAgreement(agreement: InsertAgreement & { generated_content: string }): Promise<Agreement>;
  getAgreement(id: number): Promise<Agreement | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveEmail(insertEmail: InsertEmail): Promise<Email> {
    const [email] = await db
      .insert(emails)
      .values(insertEmail)
      .returning();
    return email;
  }

  async saveAgreement(agreementData: InsertAgreement & { generated_content: string }): Promise<Agreement> {
    const [agreement] = await db
      .insert(agreements)
      .values({
        ...agreementData,
        special_clauses: agreementData.special_clauses || null,
      })
      .returning();
    return agreement;
  }

  async getAgreement(id: number): Promise<Agreement | undefined> {
    const [agreement] = await db.select().from(agreements).where(eq(agreements.id, id));
    return agreement || undefined;
  }
}

export const storage = new DatabaseStorage();
