import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/session";
import { updatePost } from "../../../actions/post";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  // 1. Login check
  const session = await getSession();

  if (!session || typeof session.userId !== "string") {
    redirect("/login");
  }

  // 2. URL එකෙන් Post ID එක ගන්න
  const { id } = await params;

  // 3. Database එකෙන් post එක ගන්න
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  // Post එක නැත්නම් 404
  if (!post) {
    notFound();
  }

  // 4. මේ post එක login user ගේද බලන්න
  if (post.authorId !== session.userId) {
    redirect("/");
  }

  // 5. Post එක create කරලා විනාඩි 10ක් ගිහින්ද බලන්න
  const tenMinutes = 10 * 60 * 1000;
  const postAge = Date.now() - post.createdAt.getTime();

  if (postAge > tenMinutes) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-black">
            Edit Time Expired
          </h1>

          <p className="mt-3 text-gray-700">
            Posts can only be edited within 10 minutes of creation.
          </p>

          <Link
            href={`/posts/${post.id}`}
            className="mt-5 inline-block rounded-md bg-black px-4 py-2 text-white"
          >
            Back to Post
          </Link>
        </div>
      </main>
    );
  }

  // 6. Post ID එක Server Action එකට bind කරනවා
  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-black">
          Edit Post
        </h1>

        <form action={updatePostWithId} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-black"
            >
              Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={post.title}
              className="w-full rounded-md border px-3 py-2 text-black"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-1 block text-sm font-medium text-black"
            >
              Content
            </label>

            <textarea
              id="content"
              name="content"
              required
              rows={6}
              defaultValue={post.content}
              className="w-full rounded-md border px-3 py-2 text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Update Post
          </button>
        </form>

        <Link
          href={`/posts/${post.id}`}
          className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline"
        >
          Cancel
        </Link>
      </div>
    </main>
  );
}