"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  loginUser,
  type LoginState,
} from "../actions/auth";

const initialState: LoginState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginUser,
    initialState
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          Login
        </h1>

        <form action={formAction} className="space-y-4">
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

          {state.error && (
            <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </main>
  );
}