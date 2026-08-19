"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "../../lib/prisma";
import { getSession } from "../../lib/session";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment is too long"),
});

export async function addComment(
  postId: string,
  formData: FormData
) {
  // 1. Login user check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 2. Post එක තියෙනවද බලන්න
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // 3. Form එකෙන් comment එක ගන්න
  const content = formData.get("content");

  // 4. Validate කරන්න
  const result = commentSchema.safeParse({
    content,
  });

  if (!result.success) {
    throw new Error("Invalid comment");
  }

  // 5. Database එකට comment එක save කරන්න
  await prisma.comment.create({
    data: {
      content: result.data.content,
      userId: session.userId,
      postId: postId,
    },
  });

  // 6. Post page එක refresh කරන්න
  revalidatePath(`/posts/${postId}`);
}
export async function deleteComment(
  commentId: string,
  postId: string
) {
  // 7. Login user check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 8. Comment එක database එකෙන් ගන්න
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // 9. මේ comment එක login user ගේද බලන්න
  if (comment.userId !== session.userId) {
    throw new Error("You can only delete your own comment");
  }

  // 10. Comment එක delete කරන්න
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  // 11. Post page එක refresh කරන්න
  revalidatePath(`/posts/${postId}`);
}