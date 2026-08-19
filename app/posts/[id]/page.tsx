import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";
import { deletePost } from "../../actions/post";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({
  params,
}: PostPageProps) {
  // Login check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // URL එකෙන් Post ID එක ගන්න
  const { id } = await params;

  // Database එකෙන් Post එක ගන්න
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
    },
  });

  // Post එක නැත්නම් 404
  if (!post) {
    notFound();
  }

  // Login user මේ post එකේ owner ද?
  const isOwner = post.authorId === session.userId;

  // Delete action එකට Post ID එක දෙනවා
  const deletePostWithId = deletePost.bind(null, post.id);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-white p-6 shadow">

          {post.deletedAt ? (
            <h1 className="text-2xl font-bold text-gray-600">
              This post has been deleted. lol
            </h1>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-black">
                {post.title}
              </h1>

              <p className="mt-4 text-gray-700">
                {post.content}
              </p>
            </>
          )}

          <div className="mt-6 border-t pt-4 text-sm text-gray-500">
            <p>
              Author: {post.author.username}
            </p>

            <p>
              Created: {post.createdAt.toLocaleString()}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">

            {!post.deletedAt && isOwner && (
              <>
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white"
                >
                  Edit Post
                </Link>

                <form action={deletePostWithId}>
                  <button
                    type="submit"
                    className="rounded-md bg-red-600 px-4 py-2 text-white"
                  >
                    Delete Post
                  </button>
                </form>
              </>
            )}

            <Link
              href="/"
              className="rounded-md bg-gray-700 px-4 py-2 text-white"
            >
              Back to Home
            </Link>

          </div>
        </div>
      </div>
    </main>
  );
}