import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const agreements = pgTable("agreements", {
  id: serial("id").primaryKey(),
  // Agreement details
  agreement_date: text("agreement_date").notNull(),
  agreement_location: text("agreement_location").notNull(),
  // Landlord details
  landlord_name: text("landlord_name").notNull(),
  landlord_pan: text("landlord_pan").notNull(),
  landlord_address: text("landlord_address").notNull(),
  // Tenant details
  tenant_name: text("tenant_name").notNull(),
  tenant_aadhaar: text("tenant_aadhaar").notNull(),
  tenant_address: text("tenant_address").notNull(),
  // Property details
  property_address: text("property_address").notNull(),
  // Tenancy terms
  tenancy_months: integer("tenancy_months").notNull(),
  lease_start: text("lease_start").notNull(),
  lease_end: text("lease_end").notNull(),
  // Financial terms
  monthly_rent: integer("monthly_rent").notNull(),
  security_deposit: integer("security_deposit").notNull(),
  rent_payment_date: integer("rent_payment_date").notNull(),
  // Maintenance
  maintenance_included: boolean("maintenance_included").default(false),
  // Special clauses
  special_clauses: text("special_clauses"),
  // Contact
  email: text("email").notNull(),
  // Generated content
  generated_content: text("generated_content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmailSchema = createInsertSchema(emails).pick({
  email: true,
});

export const insertAgreementSchema = createInsertSchema(agreements).omit({
  id: true,
  generated_content: true,
  created_at: true,
});

export const agreementFormSchema = insertAgreementSchema.extend({
  landlord_name: z.string().min(2, "Landlord name must be at least 2 characters"),
  landlord_pan: z.string().min(10, "PAN number must be at least 10 characters"),
  landlord_address: z.string().min(10, "Landlord address must be at least 10 characters"),
  tenant_name: z.string().min(2, "Tenant name must be at least 2 characters"),
  tenant_aadhaar: z.string().min(12, "Aadhaar number must be at least 12 digits"),
  tenant_address: z.string().min(10, "Tenant address must be at least 10 characters"),
  property_address: z.string().min(10, "Property address must be at least 10 characters"),
  agreement_date: z.string().min(1, "Agreement date is required"),
  agreement_location: z.string().min(2, "Agreement location is required"),
  monthly_rent: z.number().min(1, "Monthly rent must be greater than 0"),
  security_deposit: z.number().min(0, "Security deposit must be 0 or greater"),
  tenancy_months: z.number().min(1, "Tenancy period must be at least 1 month"),
  rent_payment_date: z.number().min(1).max(31, "Payment date must be between 1-31"),
  lease_start: z.string().min(1, "Lease start date is required"),
  lease_end: z.string().min(1, "Lease end date is required"),
  email: z.string().email("Valid email is required"),
  special_clauses: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;
export type InsertAgreement = z.infer<typeof insertAgreementSchema>;
export type Agreement = typeof agreements.$inferSelect;
export type AgreementForm = z.infer<typeof agreementFormSchema>;
