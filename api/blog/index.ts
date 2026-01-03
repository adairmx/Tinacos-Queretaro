import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db.js';
import { blogPosts } from '../../shared/schema.js';

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
      const items = await db.select().from(blogPosts);
      return response.status(200).json(items);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return response.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = request.body;
      const { title, slug, excerpt, content, author, image, date } = body;

      const [newPost] = await db.insert(blogPosts).values({
        title,
        slug,
        excerpt,
        content,
        author,
        image,
        date,
      }).returning();

      return response.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating blog post:', error);
      return response.status(500).json({ error: 'Failed to create blog post' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
