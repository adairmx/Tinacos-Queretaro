import { db } from "./db";
import { blogPosts } from "@shared/schema";
import { initialPosts } from "../client/src/data/blog";

async function seedBlog() {
  try {
    console.log("Seeding blog posts...");
    
    for (const post of initialPosts) {
      await db.insert(blogPosts).values({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        image: post.image,
        date: post.date,
      }).onConflictDoNothing();
    }
    
    console.log(`Successfully seeded ${initialPosts.length} blog posts`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding blog posts:", error);
    process.exit(1);
  }
}

seedBlog();
