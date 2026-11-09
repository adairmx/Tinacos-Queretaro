import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, serial, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull().default("MonsterCo"),
  image: text("image").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull().default("General"),
  readingTime: integer("reading_time").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  avatar: text("avatar").notNull(),
  location: text("location").notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
});

// Providers / Técnicos afiliados
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  coverageAreas: text("coverage_areas"), // Ej: "Juriquilla, El Refugio, Centro"
  status: text("status").notNull().default("prospecto"), // 'prospecto', 'contactado', 'activo', 'inactivo'
  experienceYears: integer("experience_years").default(1),
  hasOwnEquipment: integer("has_own_equipment").default(1), // 1 = si, 0 = no
  commissionAgreedPct: integer("commission_agreed_pct").default(30), // % retenido
  rating: integer("rating").default(5),
  completedServices: integer("completed_services").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leads / Prospectos de clientes (captados por Web, Phonica llamadas o WhatsApp bot)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  city: text("city").notNull().default("Querétaro"),
  addressColonia: text("address_colonia"),
  serviceType: text("service_type").notNull(), // 'tinaco', 'cisterna', 'ambos', 'otro'
  capacityLiters: integer("capacity_liters"), // 1100, 5000, 10000, etc.
  estimatedPrice: integer("estimated_price").default(1050),
  providerPayout: integer("provider_payout"), // lo que se le paga al técnico
  commissionAmount: integer("commission_amount"), // tu margen
  preferredDate: text("preferred_date"),
  source: text("source").notNull().default("web_cotizador"), // 'phonica_ai', 'whatsapp_ai', 'web_cotizador', 'llamada'
  status: text("status").notNull().default("nuevo"), // 'nuevo', 'asignado', 'agendado', 'completado', 'cancelado'
  assignedProviderId: integer("assigned_provider_id").references(() => providers.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pruebas A/B: el índice único hace que cada visitante cuente una sola vez por evento.
export const abEvents = pgTable(
  "ab_events",
  {
    id: serial("id").primaryKey(),
    experiment: text("experiment").notNull(),
    variant: text("variant").notNull(),
    visitorId: text("visitor_id").notNull(),
    event: text("event").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("ab_events_unique").on(table.experiment, table.visitorId, table.event)],
);

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
});
export const selectProviderSchema = createSelectSchema(providers);
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadSchema = createSelectSchema(leads);
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ 
  id: true, 
  createdAt: true 
});
export const selectBlogPostSchema = createSelectSchema(blogPosts);
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export const insertAuthorSchema = createInsertSchema(authors).omit({ 
  id: true 
});
export const selectAuthorSchema = createSelectSchema(authors);
export type Author = typeof authors.$inferSelect;
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ 
  id: true 
});
export const selectSiteSettingsSchema = createSelectSchema(siteSettings);
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
