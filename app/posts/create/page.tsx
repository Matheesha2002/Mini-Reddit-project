import { createPost } from "../../actions/post";
export default function CreatePostPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-black">
          Create Post
        </h1>

        <form action={createPost} className="space-y-4">
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
              placeholder="Enter post title"
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
              placeholder="Write your post..."
              className="w-full rounded-md border px-3 py-2 text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-white"
          >
            Create Post
          </button>
        </form>
      </div>
    </main>
  );
}
