import { randomUUID } from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { blogPosts } from '../../shared/schema.js';
import { desc } from 'drizzle-orm';

// Create a serverless-compatible Postgres client and drizzle instance.
// postgres-js is used without a connection pool for serverless environments.
const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
const db = drizzle(sql);

export async function GET() {
  try {
    const items = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching blogs', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch blogs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate an id up-front to satisfy Drizzle typings and ensure the id
    // is available immediately after insert.
    const id = randomUUID();

    await db.insert(blogPosts).values({ 
      id, 
      ...body 
    });

    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating blog', error);
    return new Response(JSON.stringify({ error: 'Failed to create blog' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
