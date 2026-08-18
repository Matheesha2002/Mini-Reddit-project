"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

import { prisma } from "../../lib/prisma";
import { createSession, deleteSession } from "../../lib/session";

// =============================
// REGISTER VALIDATION
// =============================
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

// =============================
// REGISTER USER
// =============================
export async function registerUser(formData: FormData) {
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate data
  const result = registerSchema.safeParse({
    username,
    email,
    password,
  });

  if (!result.success) {
    throw new Error("Invalid registration details");
  }

  // Check username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: result.data.username },
        { email: result.data.email },
      ],
    },
  });

  if (existingUser) {
    throw new Error("Username or email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    result.data.password,
    10
  );

  // Create user in database
  await prisma.user.create({
    data: {
      username: result.data.username,
      email: result.data.email,
      password: hashedPassword,
    },
  });

  // Register success → Login page
  redirect("/login");
}

// =============================
// LOGIN VALIDATION
// =============================
const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

// =============================
// LOGIN USER
// =============================
export async function loginUser(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate data
  const result = loginSchema.safeParse({
    email,
    password,
  });

  if (!result.success) {
    throw new Error("Invalid login details");
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare entered password with hashed password
  const passwordMatch = await bcrypt.compare(
    result.data.password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  // Create login session
  await createSession(user.id);

  // Login success → Home
  redirect("/");
}

// =============================
// LOGOUT USER
// =============================
export async function logoutUser() {
  await deleteSession();

  // Logout success → Login page
  redirect("/login");
}