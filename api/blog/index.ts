import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db.js';
import { blogPosts, insertBlogPostSchema } from '../../shared/schema.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method === 'GET') {
    try {
      // Add pagination support - default to first 100 posts, ordered by creation date
      const limit = Math.min(parseInt(request.query.limit as string) || 100, 100);
      const offset = parseInt(request.query.offset as string) || 0;
      
      const items = await db.select().from(blogPosts).limit(limit).offset(offset);
      return response.status(200).json(items);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return response.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  }

  if (request.method === 'POST') {
    try {
      // Vercel automatically parses JSON body, but handle both cases
      const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      
      // Validate input using schema
      const validatedData = insertBlogPostSchema.parse(body);

      const [newPost] = await db.insert(blogPosts).values(validatedData).returning();

      return response.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating blog post:', error);
      if (error instanceof Error && 'issues' in error) {
        // Zod validation error
        return response.status(400).json({ error: 'Invalid input data', details: error });
      }
      return response.status(500).json({ error: 'Failed to create blog post' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
