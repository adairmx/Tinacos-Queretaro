import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/serverless';
import { blogs } from '../../drizzle/schema';

// Create a serverless-compatible Postgres client and drizzle instance.
// postgres-js is used without a connection pool for serverless environments.
const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
const db = drizzle(sql);

export async function GET() {
  try {
    const items = await db.select().from(blogs).all();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching blogs', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    // Generate an id up-front to satisfy Drizzle typings and ensure the id
    // is available immediately after insert.
    const id = randomUUID();

    await db.insert(blogs).values({ id, title, content });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
