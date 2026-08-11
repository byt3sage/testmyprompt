import { NextResponse } from "next/server";

import { validateApiToken } from "@/lib/api-tokens";
import { db } from "@/lib/db";
import {
  buildCategoriesChecked,
  getRiskLevelLabel,
  getScoringProfileForPlan,
  scorePrompt,
} from "@/lib/prompt-scoring";
import { ensureWithinPlanLimit, getWorkspaceUsage } from "@/lib/usage";
import { v1TestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const apiToken = await validateApiToken(request.headers.get("Authorization"));

    const json = await request.json();
    const parsed = v1TestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { workspaceId, userId } = apiToken;

    if (apiToken.workspace.plan === "FREE") {
      return NextResponse.json(
        { error: "API access is not available on the free plan. Please upgrade to Pro or Business." },
        { status: 403 }
      );
    }

    const profile = getScoringProfileForPlan(apiToken.workspace.plan);

    const existing = await db.promptTest.findFirst({
      where: { workspaceId, userId, prompt: parsed.data.prompt, targetModel: null },
      include: { findings: true },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      const usage = await getWorkspaceUsage(workspaceId);
      return NextResponse.json({
        id: existing.id,
        score: existing.score,
        level: getRiskLevelLabel(existing.score, existing.findings),
        summary: existing.summary,
        findings: existing.findings.map((f) => ({
          category: f.category,
          severity: f.severity,
          explanation: f.explanation,
          recommendation: f.recommendation,
        })),
        improvedPrompt: existing.improvedPrompt ?? null,
        cached: true,
        usage: { used: usage.used, limit: usage.limit, remaining: usage.remaining },
      });
    }

    const limitCheck = await ensureWithinPlanLimit(workspaceId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "Monthly test limit reached for this workspace.", usage: limitCheck.usage },
        { status: 402 }
      );
    }

    const scored = await scorePrompt(parsed.data.prompt, undefined, profile);

    const test = await db.promptTest.create({
      data: {
        workspaceId,
        userId,
        prompt: parsed.data.prompt,
        targetModel: null,
        score: scored.score,
        summary: scored.summary,
        improvedPrompt: scored.improvedPrompt ?? null,
        findings: {
          create: scored.findings.map((f) => ({
            category: f.category,
            severity: f.severity,
            explanation: f.explanation,
            recommendation: f.recommendation,
          })),
        },
      },
      include: { findings: true },
    });

    const usage = await getWorkspaceUsage(workspaceId);

    return NextResponse.json(
      {
        id: test.id,
        score: test.score,
        level: getRiskLevelLabel(test.score, test.findings),
        summary: test.summary,
        findings: test.findings.map((f) => ({
          category: f.category,
          severity: f.severity,
          explanation: f.explanation,
          recommendation: f.recommendation,
        })),
        improvedPrompt: test.improvedPrompt ?? null,
        usage: {
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = `${error}`;
    if (msg.includes("Unauthorized")) {
      return NextResponse.json({ error: msg.replace("Error: ", "") }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
