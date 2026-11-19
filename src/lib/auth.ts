import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth/minimal";
import { getPrisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
});
