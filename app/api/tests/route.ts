import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { assertWorkspaceRole, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildCategoriesChecked,
  getScoringProfileForPlan,
  scorePrompt,
} from "@/lib/prompt-scoring";
import { checkIpLimit, ensureWithinPlanLimit, getWorkspaceUsage } from "@/lib/usage";
import { promptTestSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await assertWorkspaceRole(user.id, workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]);

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const profile = getScoringProfileForPlan(workspace.plan);

    const tests = await db.promptTest.findMany({
      where: { workspaceId },
      include: {
        findings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const testsWithCategories = tests.map((test) => ({
      ...test,
      categoriesChecked: buildCategoriesChecked(test.findings, profile),
    }));

    const usage = await getWorkspaceUsage(workspaceId);

    return NextResponse.json({ tests: testsWithCategories, usage });
  } catch (error) {
    if (`${error}`.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (`${error}`.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Unable to fetch tests", details: `${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    // x-forwarded-for may be a comma-separated list; take the first (client) IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    const json = await request.json();
    const parsed = promptTestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await assertWorkspaceRole(user.id, parsed.data.workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]);

    const workspace = await db.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
      select: { plan: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const profile = getScoringProfileForPlan(workspace.plan);

    const limitCheck = await ensureWithinPlanLimit(parsed.data.workspaceId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Monthly test limit reached for this workspace.",
          usage: limitCheck.usage,
        },
        { status: 402 }
      );
    }

    const ipAllowed = await checkIpLimit(ip, workspace.plan);
    if (!ipAllowed) {
      return NextResponse.json(
        { error: "Monthly test limit reached for your IP address." },
        { status: 429 }
      );
    }

    const scored = await scorePrompt(parsed.data.prompt, parsed.data.targetModel, profile);

    const created = await db.promptTest.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        userId: user.id,
        prompt: parsed.data.prompt,
        targetModel: parsed.data.targetModel,
        score: scored.score,
        summary: scored.summary,
        improvedPrompt: scored.improvedPrompt ?? null,
        ipAddress: ip,
        findings: {
          create: scored.findings.map((finding) => ({
            category: finding.category,
            severity: finding.severity,
            explanation: finding.explanation,
            recommendation: finding.recommendation,
          })),
        },
      },
      include: {
        findings: true,
      },
    });

    const testWithCategories = {
      ...created,
      categoriesChecked: buildCategoriesChecked(created.findings, profile),
    };

    const usage = await getWorkspaceUsage(parsed.data.workspaceId);

    return NextResponse.json({ test: testWithCategories, usage }, { status: 201 });
  } catch (error) {
    if (`${error}`.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (`${error}`.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Unable to run prompt test", details: `${error}` },
      { status: 500 }
    );
  }
}
