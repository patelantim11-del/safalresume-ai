import type { BlogPost } from "@/types";

export const BLOG_COLLECTION = "blog_posts";
export type BlogPostModel = BlogPost;

export const blogCollectionIndexes = [
  { key: { slug: 1 }, unique: true },
  { key: { category: 1, createdAt: -1 } },
  { key: { featured: 1, createdAt: -1 } },
  { key: { createdAt: -1 } },
];
