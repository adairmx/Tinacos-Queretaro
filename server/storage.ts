import { users, blogPosts, authors, siteSettings, type User, type InsertUser, type BlogPost, type InsertBlogPost, type Author, type InsertAuthor, type SiteSettings, type InsertSiteSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
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
  getAuthorByUsername(username: string): Promise<Author | undefined>; // Placeholder for potential multi-author
  updateAuthor(id: number, author: Partial<InsertAuthor>): Promise<Author>;
  
  // Settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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
    const [post] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();
    return post || undefined;
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
}

export const storage = new DatabaseStorage();
