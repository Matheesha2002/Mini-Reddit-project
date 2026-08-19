import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "../../lib/prisma";
import { getSession } from "../../lib/session";

export default async function ProfilePage() {
  // 1. Login user check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 2. User + Posts + Votes database එකෙන් ගන්න
  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },

    include: {
      posts: {
        include: {
          votes: true,
        },
      },
    },
  });

  // User නැත්නම් login page එකට
  if (!user) {
    redirect("/login");
  }

  // 3. Total Posts
  const totalPosts = user.posts.length;

  // 4. Reputation calculate කරන්න
  const reputation = user.posts.reduce((total, post) => {
    const upvotes = post.votes.filter(
      (vote) => vote.type === "UPVOTE"
    ).length;

    const downvotes = post.votes.filter(
      (vote) => vote.type === "DOWNVOTE"
    ).length;

    return total + upvotes * 5 - downvotes * 2;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-lg bg-white p-6 shadow">

          <h1 className="text-3xl font-bold text-black">
            User Profile
          </h1>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Username
              </p>

              <p className="text-lg font-semibold text-black">
                {user.username}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Join Date
              </p>

              <p className="text-lg font-semibold text-black">
                {user.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Posts
              </p>

              <p className="text-lg font-semibold text-black">
                {totalPosts}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Reputation Score
              </p>

              <p className="text-lg font-semibold text-black">
                {reputation}
              </p>
            </div>

          </div>

          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-white"
          >
            Back to Home
          </Link>

        </div>
      </div>
    </main>
  );
}