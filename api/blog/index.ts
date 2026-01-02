import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blog } from '@/db/schema';
import type { InferModel } from 'drizzle-orm';

// POST /api/blog
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Minimal validation - adapt to your project's validation schema (zod, yup, etc.)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Missing required fields: title and content' }, { status: 400 });
    }

    const validatedData = {
      title: String(body.title),
      content: String(body.content),
      // include other fields you expect on insert, with defaults if needed
      published: Boolean(body.published ?? false),
      // example timestamp field — adjust name/format to match your schema
      created_at: body.created_at ? new Date(body.created_at) : new Date(),
    } as const;

    // Generate id before insert to satisfy drizzle's insert typings
    const id = randomUUID();

    // Use drizzle's InferModel to get the correct insert type for the blog table
    type NewBlog = InferModel<typeof blog, 'insert'>;

    const dataToInsert = { id, ...validatedData } as unknown as NewBlog;

    await db.insert(blog).values(dataToInsert);

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    console.error('Error inserting blog:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
