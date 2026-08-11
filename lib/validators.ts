import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  workspaceName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
  turnstileToken: z.string().optional(),
});

export const workspaceSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and dashes."),
});

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.MEMBER),
});

export const promptTestSchema = z.object({
  workspaceId: z.string().cuid(),
  prompt: z.string().min(10).max(12000),
  targetModel: z.string().min(2).max(120).optional(),
});

export const billingCheckoutSchema = z.object({
  workspaceId: z.string().cuid(),
  plan: z.enum(["PRO", "BUSINESS"]),
});

export const billingPortalSchema = z.object({
  workspaceId: z.string().cuid(),
});

export const createTokenSchema = z.object({
  workspaceId: z.string().cuid(),
  name: z.string().min(2).max(60),
});

export const v1TestSchema = z.object({
  prompt: z.string().min(10).max(12000),
  model: z.string().max(120).optional(),
});
