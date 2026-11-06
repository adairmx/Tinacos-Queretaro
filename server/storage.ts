import { 
  users, blogPosts, authors, siteSettings, providers, leads,
  type User, type InsertUser, 
  type BlogPost, type InsertBlogPost, 
  type Author, type InsertAuthor, 
  type SiteSettings, type InsertSiteSettings,
  type Provider, type InsertProvider,
  type Lead, type InsertLead
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;

  // Authors
  getAuthor(id: number): Promise<Author | undefined>;
  getAuthorByUsername(username: string): Promise<Author | undefined>;
  updateAuthor(id: number, author: Partial<InsertAuthor>): Promise<Author>;
  
  // Settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  // Providers
  getAllProviders(): Promise<Provider[]>;
  getProvidersByCity(city: string): Promise<Provider[]>;
  getProviderById(id: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, provider: Partial<InsertProvider>): Promise<Provider | undefined>;

  // Leads
  getAllLeads(): Promise<Lead[]>;
  getLeadById(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
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

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updateBlogPost(id: string, updateData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const trimmedId = id.trim();
    console.log(`Attempting to update post with ID: "${trimmedId}"`);
    try {
      const [post] = await db
        .update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, trimmedId))
        .returning();
      
      if (!post) {
        console.warn(`No post found for update with ID: "${trimmedId}"`);
        // Diagnostic: check if post exists at all
        const [exists] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.id, trimmedId));
        if (!exists) {
          console.error(`CRITICAL: Post with ID "${trimmedId}" actually does not exist in the database.`);
          // List a few existing IDs for comparison
          const allIds = await db.select({ id: blogPosts.id }).from(blogPosts).limit(5);
          console.log("Current existing IDs (first 5):", allIds.map(a => a.id));
        } else {
          console.log(`DIAGNOSTIC: Post "${trimmedId}" exists, but update returning() was empty. This is unexpected.`);
        }
      } else {
        console.log(`Successfully updated post: ${post.title} (${post.id})`);
      }
      
      return post || undefined;
    } catch (error) {
      console.error("Database error during updateBlogPost:", error);
      throw error;
    }
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Authors - assume single author for now (id: 1)
  async getAuthor(id: number): Promise<Author | undefined> {
    const [author] = await db.select().from(authors).where(eq(authors.id, id));
    return author || undefined;
  }

  async getAuthorByUsername(username: string): Promise<Author | undefined> {
    const [author] = await db.select().from(authors).where(eq(authors.name, username));
    return author || undefined;
  }

  async updateAuthor(id: number, updateData: Partial<InsertAuthor>): Promise<Author> {
    const [existing] = await db.select().from(authors).where(eq(authors.id, id));
    if (!existing) {
      const [author] = await db.insert(authors).values(updateData as InsertAuthor).returning();
      return author;
    }
    const [author] = await db.update(authors).set(updateData).where(eq(authors.id, id)).returning();
    return author;
  }

  // Settings - single row (id: 1)
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    return settings || undefined;
  }

  async updateSiteSettings(updateData: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    if (!existing) {
      const [settings] = await db.insert(siteSettings).values({ ...updateData, id: 1 } as InsertSiteSettings).returning();
      return settings;
    }
    const [settings] = await db.update(siteSettings).set(updateData).where(eq(siteSettings.id, 1)).returning();
    return settings;
  }

  // Providers
  async getAllProviders(): Promise<Provider[]> {
    return await db.select().from(providers).orderBy(desc(providers.createdAt));
  }

  async getProvidersByCity(city: string): Promise<Provider[]> {
    return await db.select().from(providers).where(eq(providers.city, city)).orderBy(desc(providers.rating));
  }

  async getProviderById(id: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db.insert(providers).values(insertProvider).returning();
    return provider;
  }

  async updateProvider(id: number, updateData: Partial<InsertProvider>): Promise<Provider | undefined> {
    const [provider] = await db.update(providers).set(updateData).where(eq(providers.id, id)).returning();
    return provider || undefined;
  }

  // Leads
  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, updateData: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }
}

export const storage = new DatabaseStorage();
