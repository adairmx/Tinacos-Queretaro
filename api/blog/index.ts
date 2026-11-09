import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc } from 'drizzle-orm';
import { db } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { blogPosts, insertBlogPostSchema } from '../../shared/schema.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {

  if (request.method === 'GET') {
    try {
      // Add pagination support - default to first 100 posts, ordered by creation date (newest first)
      const limit = Math.min(parseInt(request.query.limit as string) || 100, 100);
      const offset = parseInt(request.query.offset as string) || 0;
      
      const items = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset);
      return response.status(200).json(items);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return response.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  }

  if (request.method === 'POST') {
    if (!requireAdmin(request, response)) return;
    try {
      // Vercel automatically parses JSON body, but handle both cases safely
      let body;
      try {
        body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      } catch (parseError) {
        return response.status(400).json({ error: 'Invalid JSON in request body' });
      }
      
      // Validate input using schema
      const validatedData = insertBlogPostSchema.parse(body);

      const [newPost] = await db.insert(blogPosts).values(validatedData).returning();

      return response.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating blog post:', error);
      if (error instanceof Error && 'issues' in error) {
        // Zod validation error - return only the validation issues
        return response.status(400).json({ 
          error: 'Invalid input data', 
          issues: (error as any).issues 
        });
      }
      return response.status(500).json({ error: 'Failed to create blog post' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
