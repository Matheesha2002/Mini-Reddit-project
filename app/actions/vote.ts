"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "../../lib/prisma";
import { getSession } from "../../lib/session";

async function votePost(
  postId: string,
  type: "UPVOTE" | "DOWNVOTE"
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

  // Deleted post වලට vote කරන්න දෙන්නේ නැහැ
  if (post.deletedAt) {
    throw new Error("You cannot vote on a deleted post");
  }

  // 3. මේ user කලින් මේ post එකට vote කරලාද බලන්න
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_postId: {
        userId: session.userId,
        postId: postId,
      },
    },
  });

  // 4. කලින් vote එකක් නැත්නම් අලුත් vote එකක් create කරනවා
  if (!existingVote) {
    await prisma.vote.create({
      data: {
        userId: session.userId,
        postId: postId,
        type: type,
      },
    });
  }

  // 5. Same vote එක ආයෙත් click කළොත් vote එක remove කරනවා
  else if (existingVote.type === type) {
    await prisma.vote.delete({
      where: {
        id: existingVote.id,
      },
    });
  }

  // 6. Upvote → Downvote හෝ Downvote → Upvote නම් change කරනවා
  else {
    await prisma.vote.update({
      where: {
        id: existingVote.id,
      },
      data: {
        type: type,
      },
    });
  }

  // 7. Updated vote data UI එකට refresh කරන්න
  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
}

// Upvote
export async function upvotePost(postId: string) {
  await votePost(postId, "UPVOTE");
}

// Downvote
export async function downvotePost(postId: string) {
  await votePost(postId, "DOWNVOTE");
}