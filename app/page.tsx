import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutUser } from "./actions/auth";
import { getSession } from "../lib/session";
import { prisma } from "../lib/prisma";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">
            Mini Reddit
          </h1>

          <div className="flex gap-3">
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

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-600">
                No posts yet.
              </p>
            </div>
          ) : (
            posts.map((post) => (
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
                        Created: {post.createdAt.toLocaleString()}
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

                    <div className="mt-4 text-sm text-gray-500">
                      <p>
                        Author: {post.author.username}
                      </p>

                      <p>
                        Created: {post.createdAt.toLocaleString()}
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
            ))
          )}
        </div>
      </div>
    </main>
  );
}