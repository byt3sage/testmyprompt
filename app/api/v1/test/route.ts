import { NextResponse } from "next/server";

import { validateApiToken } from "@/lib/api-tokens";
import { db } from "@/lib/db";
import {
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
    const profile = getScoringProfileForPlan(apiToken.workspace.plan);

    const limitCheck = await ensureWithinPlanLimit(workspaceId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "Monthly test limit reached for this workspace.", usage: limitCheck.usage },
        { status: 402 }
      );
    }

    const scored = await scorePrompt(parsed.data.prompt, parsed.data.model, profile);

    const test = await db.promptTest.create({
      data: {
        workspaceId,
        userId,
        prompt: parsed.data.prompt,
        targetModel: parsed.data.model ?? null,
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
