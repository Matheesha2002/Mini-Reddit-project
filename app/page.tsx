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
  // Login check
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // URL එකෙන් search text එක ගන්න
  const { q } = await searchParams;

  const searchText = q?.trim() ?? "";

  // Database එකෙන් posts ගන්න
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
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">
            Mini Reddit
          </h1>

          <div className="flex gap-3">
            <Link
               href="/profile"
                className="rounded-md bg-purple-600 px-4 py-2 text-white"
             >
              Profile
            </Link>
            <Link
              href="/posts/create"
              className="rounded-md bg-black px-4 py-2 text-white"
            >
              Create Post
            </Link>

            <form action={logoutUser}>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-white"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Search Bar */}
        <form
          action="/"
          method="GET"
          className="mb-8 flex gap-2"
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
              className="rounded-md bg-gray-600 px-5 py-2 text-white"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Search Result Message */}
        {searchText && (
          <p className="mb-4 text-sm text-gray-600">
            Search results for:{" "}
            <span className="font-semibold">
              {searchText}
            </span>
          </p>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-600">
                {searchText
                  ? "No posts found."
                  : "No posts yet."}
              </p>
            </div>
          ) : (
            posts.map((post) => {
              const upvoteCount = post.votes.filter(
                (vote) => vote.type === "UPVOTE"
              ).length;

              const downvoteCount = post.votes.filter(
                (vote) => vote.type === "DOWNVOTE"
              ).length;

              return (
                <div
                  key={post.id}
                  className="rounded-lg bg-white p-6 shadow"
                >
                  {post.deletedAt ? (
                    <>
                      <p className="text-lg font-semibold text-gray-600">
                        This post has been deleted. lol
                      </p>

                      <div className="mt-4 text-sm text-gray-500">
                        <p>
                          Author: {post.author.username}
                        </p>

                        <p>
                          Created:{" "}
                          {post.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <Link
                        href={`/posts/${post.id}`}
                        className="mt-4 inline-block rounded-md bg-gray-700 px-4 py-2 text-white"
                      >
                        View Post
                      </Link>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-black">
                        {post.title}
                      </h2>

                      <p className="mt-2 text-gray-700">
                        {post.content}
                      </p>

                      <div className="mt-4 flex gap-4">
                        <span className="text-sm font-medium text-green-700">
                          ⬆ Upvotes: {upvoteCount}
                        </span>

                        <span className="text-sm font-medium text-orange-700">
                          ⬇ Downvotes: {downvoteCount}
                        </span>
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        <p>
                          Author: {post.author.username}
                        </p>

                        <p>
                          Created:{" "}
                          {post.createdAt.toLocaleString()}
                        </p>
                      </div>

                      <Link
                        href={`/posts/${post.id}`}
                        className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white"
                      >
                        View Post
                      </Link>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}