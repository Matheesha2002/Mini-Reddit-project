import Link from "next/link";
import { registerUser } from "../actions/auth";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          Create Account
        </h1>

        <form action={registerUser} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-black"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Enter username"
              className="w-full rounded-md border px-3 py-2 text-black"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-black"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter email"
              className="w-full rounded-md border px-3 py-2 text-black"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-black"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter password"
              className="w-full rounded-md border px-3 py-2 text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-white"
          >
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}