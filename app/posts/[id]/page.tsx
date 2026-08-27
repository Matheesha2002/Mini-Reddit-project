import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/session";

import { deletePost } from "../../actions/post";
import { upvotePost, downvotePost } from "../../actions/vote";
import {
  addComment,
  deleteComment,
} from "../../actions/comment";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({
  params,
}: PostPageProps) {
  // 1. Login check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 2. URL එකෙන් Post ID එක ගන්න
  const { id } = await params;

  // 3. Database එකෙන් Post එක ගන්න
  const post = await prisma.post.findUnique({
    where: {
      id,
    },

    include: {
      author: true,

      votes: true,

      comments: {
        include: {
          user: true,
        },

        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  // Post එක නැත්නම් 404
  if (!post) {
    notFound();
  }

  // 4. Upvote count
  const upvoteCount = post.votes.filter(
    (vote) => vote.type === "UPVOTE"
  ).length;

  // 5. Downvote count
  const downvoteCount = post.votes.filter(
    (vote) => vote.type === "DOWNVOTE"
  ).length;

  // 6. Login user මේ post එකේ owner ද?
  const isOwner = post.authorId === session.userId;

  // 7. Post Actions වලට ID bind කරනවා
  const deletePostWithId = deletePost.bind(
    null,
    post.id
  );

  const upvotePostWithId = upvotePost.bind(
    null,
    post.id
  );

  const downvotePostWithId = downvotePost.bind(
    null,
    post.id
  );

  const addCommentWithId = addComment.bind(
    null,
    post.id
  );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* POST CARD */}
        <div className="rounded-lg bg-white p-6 shadow">

          {/* Deleted Post */}
          {post.deletedAt ? (
            <h1 className="text-2xl font-bold text-gray-600">
              This post has been deleted.
            </h1>
          ) : (
            <>
              {/* Post Title */}
              <h1 className="text-3xl font-bold text-black">
                {post.title}
              </h1>

              {/* Post Content */}
              <p className="mt-4 text-gray-700">
                {post.content}
              </p>

              {/* Voting */}
              <div className="mt-6 flex flex-wrap gap-3">
                <form action={upvotePostWithId}>
                  <button
                    type="submit"
                    className="rounded-md bg-green-600 px-4 py-2 text-white"
                  >
                    ⬆ Upvote ({upvoteCount})
                  </button>
                </form>

                <form action={downvotePostWithId}>
                  <button
                    type="submit"
                    className="rounded-md bg-orange-600 px-4 py-2 text-white"
                  >
                    ⬇ Downvote ({downvoteCount})
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Post Information */}
          <div className="mt-6 border-t pt-4 text-sm text-gray-500">
            <p>
              Author: {post.author.username}
            </p>

            <p>
              Created: {post.createdAt.toLocaleString()}
            </p>
          </div>

          {/* Post Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {!post.deletedAt && isOwner && (
              <>
                {/* Edit Post */}
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white"
                >
                  Edit Post
                </Link>

                {/* Delete Post */}
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

            {/* Back Home */}
            <Link
              href="/"
              className="rounded-md bg-gray-700 px-4 py-2 text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">

          <h2 className="text-xl font-bold text-black">
            Comments ({post.comments.length})
          </h2>

          {/* Add Comment */}
          {!post.deletedAt && (
            <form
              action={addCommentWithId}
              className="mt-4 space-y-3"
            >
              <textarea
                name="content"
                required
                rows={3}
                placeholder="Write a comment..."
                className="w-full rounded-md border px-3 py-2 text-black"
              />

              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-white"
              >
                Add Comment
              </button>
            </form>
          )}

          {/* Comments List */}
          <div className="mt-6 space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-gray-500">
                No comments yet.
              </p>
            ) : (
              post.comments.map((comment) => {
                // මේ comment එක login user ගේද?
                const isCommentOwner =
                  comment.userId === session.userId;

                // Delete action එකට IDs bind කරනවා
                const deleteCommentWithId =
                  deleteComment.bind(
                    null,
                    comment.id,
                    post.id
                  );

                return (
                  <div
                    key={comment.id}
                    className="rounded-md bg-gray-100 p-4"
                  >
                    {/* Comment content */}
                    <p className="text-gray-800">
                      {comment.content}
                    </p>

                    {/* Comment user + date */}
                    <p className="mt-2 text-sm text-gray-500">
                      {comment.user.username} ·{" "}
                      {comment.createdAt.toLocaleString()}
                    </p>

                    {/* Own Comment Delete Button */}
                    {isCommentOwner && (
                      <form
                        action={deleteCommentWithId}
                        className="mt-3"
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-3 py-1 text-sm text-white"
                        >
                          Delete Comment
                        </button>
                      </form>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}