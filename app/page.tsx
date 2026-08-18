import { redirect } from "next/navigation";
import { logoutUser } from "./actions/auth";
import { getSession } from "../lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-black">
        Mini Reddit
      </h1>

      <p className="text-black">
        You are logged in ✅
      </p>

      <form action={logoutUser}>
        <button
          type="submit"
          className="rounded-md bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </form>
    </main>
  );
}