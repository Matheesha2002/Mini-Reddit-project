import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutUser } from "./actions/auth";
import { getSession } from "../lib/session";
import { prisma } from "../lib/prisma";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  // 1. Login check
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // 2. Search text එක URL එකෙන් ගන්න
  const { q } = await searchParams;

  const searchText = q?.trim() ?? "";

  // 3. Database එකෙන් posts ගන්න
  const posts = await prisma.post.findMany({
    where: searchText
      ? {
          deletedAt: null,

          OR: [
            {
              title: {
                contains: searchText,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: searchText,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,

    include: {
      author: true,
      votes: true,
      comments: true,
    },
  });

  // =================================
  // 4. RANKING ALGORITHM
  // =================================

  const rankedPosts = posts
    .map((post) => {
      // Upvotes count
      const upvoteCount = post.votes.filter(
        (vote) => vote.type === "UPVOTE"
      ).length;

      // Downvotes count
      const downvoteCount = post.votes.filter(
        (vote) => vote.type === "DOWNVOTE"
      ).length;

      // Comments count
      const commentCount = post.comments.length;

      // Post එක පැරණි පැය ගණන
      const ageInHours =
        (Date.now() - post.createdAt.getTime()) /
        (1000 * 60 * 60);

      /*
        Ranking Formula

        Upvote      = +5
        Downvote    = -2
        Comment     = +2
        Age penalty = -0.1 per hour
      */

      const rankingScore =
        upvoteCount * 5 -
        downvoteCount * 2 +
        commentCount * 2 -
        ageInHours * 0.1;

      return {
        ...post,
        upvoteCount,
        downvoteCount,
        commentCount,
        rankingScore,
      };
    })

    // Score වැඩි post එක උඩට
    .sort((a, b) => {
      // Deleted posts අන්තිමට
      if (a.deletedAt && !b.deletedAt) {
        return 1;
      }

      if (!a.deletedAt && b.deletedAt) {
        return -1;
      }

      return b.rankingScore - a.rankingScore;
    });

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-black">
            Mini Reddit
          </h1>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">

            {/* Profile */}
            <Link
              href="/profile"
              className="rounded-md bg-purple-600 px-4 py-2 text-center text-white"
            >
              Profile
            </Link>

            {/* Create Post */}
            <Link
              href="/posts/create"
              className="rounded-md bg-black px-4 py-2 text-center text-white"
            >
              Create Post
            </Link>

            {/* Logout */}
            <form action={logoutUser}>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-center text-white"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* SEARCH */}
        <form
          action="/"
          method="GET"
          className="mb-8 flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="text"
            name="q"
            defaultValue={searchText}
            placeholder="Search posts..."
            className="w-full rounded-md border bg-white px-4 py-2 text-black"
          />

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-5 py-2 text-white"
          >
            Search
          </button>

          {searchText && (
            <Link
              href="/"
              className="rounded-md bg-gray-600 px-5 py-2 text-center text-white"
            >
              Clear
            </Link>
          )}
        </form>

        {/* SEARCH MESSAGE */}
        {searchText && (
          <p className="mb-4 text-sm text-gray-600">
            Search results for:{" "}
            <span className="font-semibold">
              {searchText}
            </span>
          </p>
        )}

        {/* POSTS */}
        <div className="space-y-4">
          {rankedPosts.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-600">
                {searchText
                  ? "No posts found."
                  : "No posts yet."}
              </p>
            </div>
          ) : (
            rankedPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg bg-white p-6 shadow"
              >
                {post.deletedAt ? (
                  <>
                    {/* DELETED POST */}
                    <p className="text-lg font-semibold text-gray-600">
                      This post has been deleted.
                    </p>

                    <div className="mt-4 text-sm text-gray-500">
                      <p>
                        Author: {post.author.username}
                      </p>

                      <p>
                        Created:{" "}
                        {post.createdAt.toLocaleString()}
                      </p>

                      <p>
                        Comments: {post.commentCount}
                      </p>
                    </div>

                    <Link
                      href={`/posts/${post.id}`}
                      className="mt-4 block w-full rounded-md bg-gray-700 px-4 py-2 text-center text-white sm:inline-block sm:w-auto"
                    >
                      View Post
                    </Link>
                  </>
                ) : (
                  <>
                    {/* NORMAL POST */}

                    <h2 className="text-xl font-bold text-black">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-gray-700">
                      {post.content}
                    </p>

                    {/* Votes + Comments */}
                    <div className="mt-4 flex flex-wrap gap-4">
                      <span className="text-sm font-medium text-green-700">
                        ⬆ Upvotes: {post.upvoteCount}
                      </span>

                      <span className="text-sm font-medium text-orange-700">
                        ⬇ Downvotes: {post.downvoteCount}
                      </span>

                      <span className="text-sm font-medium text-blue-700">
                        💬 Comments: {post.commentCount}
                      </span>
                    </div>

                    {/* Post Information */}
                    <div className="mt-4 text-sm text-gray-500">
                      <p>
                        Author: {post.author.username}
                      </p>

                      <p>
                        Created:{" "}
                        {post.createdAt.toLocaleString()}
                      </p>
                    </div>

                    {/* View Post */}
                    <Link
                      href={`/posts/${post.id}`}
                      className="mt-4 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-white sm:inline-block sm:w-auto"
                    >
                      View Post
                    </Link>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}