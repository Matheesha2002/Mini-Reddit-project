"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { prisma } from "../../lib/prisma";
import { getSession } from "../../lib/session";

// =============================
// POST VALIDATION
// =============================
const postSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  content: z
    .string()
    .min(1, "Content is required"),
});

// =============================
// CREATE POST
// =============================
export async function createPost(formData: FormData) {
  // 1. Login user check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 2. Form data ගන්න
  const title = formData.get("title");
  const content = formData.get("content");

  // 3. Validate කරන්න
  const result = postSchema.safeParse({
    title,
    content,
  });

  if (!result.success) {
    throw new Error("Invalid post details");
  }

  // 4. පැයකට posts 5 limit එක check කරන්න
  const oneHourAgo = new Date(
    Date.now() - 60 * 60 * 1000
  );

  const postCount = await prisma.post.count({
    where: {
      authorId: session.userId,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  if (postCount >= 5) {
    throw new Error(
      "You can only create 5 posts per hour"
    );
  }

  // 5. Database එකට Post save කරන්න
  await prisma.post.create({
    data: {
      title: result.data.title,
      content: result.data.content,
      authorId: session.userId,
    },
  });

  // 6. Home page එකට යන්න
  redirect("/");
}

// =============================
// UPDATE POST
// =============================
export async function updatePost(
  postId: string,
  formData: FormData
) {
  // 1. Login user check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 2. Post එක database එකෙන් ගන්න
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // 3. Deleted post එකක්ද බලන්න
  if (post.deletedAt) {
    throw new Error("Deleted posts cannot be edited");
  }

  // 4. Post එක තමන්ගේද බලන්න
  if (post.authorId !== session.userId) {
    throw new Error(
      "You can only edit your own post"
    );
  }

  // 5. විනාඩි 10 limit එක check කරන්න
  const tenMinutes = 10 * 60 * 1000;

  const postAge =
    Date.now() - post.createdAt.getTime();

  if (postAge > tenMinutes) {
    throw new Error(
      "Post can only be edited within 10 minutes"
    );
  }

  // 6. Form data ගන්න
  const title = formData.get("title");
  const content = formData.get("content");

  // 7. Validate කරන්න
  const result = postSchema.safeParse({
    title,
    content,
  });

  if (!result.success) {
    throw new Error("Invalid post details");
  }

  // 8. Database එක update කරන්න
  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      title: result.data.title,
      content: result.data.content,
    },
  });

  // 9. Single Post page එකට යන්න
  redirect(`/posts/${postId}`);
}

// =============================
// SOFT DELETE POST
// =============================
export async function deletePost(postId: string) {
  // 1. Login user check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 2. Post එක database එකෙන් ගන්න
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // 3. Post එක තමන්ගේද බලන්න
  if (post.authorId !== session.userId) {
    throw new Error(
      "You can only delete your own post"
    );
  }

  // 4. Already deleted ද බලන්න
  if (post.deletedAt) {
    throw new Error("Post is already deleted");
  }

  // 5. SOFT DELETE
  // Record එක database එකෙන් මකන්නේ නැහැ
  // deletedAt එකට current date/time එක දානවා
  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // 6. Home page එකට යන්න
  redirect("/");
}