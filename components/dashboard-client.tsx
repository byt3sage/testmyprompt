"use client";

import {
  Clock,
  CreditCard,
  LogOut,
  Settings2,
  ShieldAlert,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "scanner" | "history" | "workspace" | "billing" | "api";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "PRO" | "BUSINESS";
};

type Finding = {
  id: string;
  category: string;
  severity: string;
  explanation: string;
  recommendation: string;
};

type CategoryResult = {
  category: string;
  domain: "security" | "safety-ethics" | "quality";
  passed: boolean;
};

type PromptTest = {
  id: string;
  score: number;
  summary: string;
  targetModel: string | null;
  createdAt: string | Date;
  improvedPrompt?: string | null;
  findings: Finding[];
  categoriesChecked?: CategoryResult[];
};

type Usage = {
  used: number;
  limit: number;
  remaining: number;
};

type ApiTokenRow = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | Date | null;
  createdAt: string | Date;
  user: { name: string | null; email: string };
};

type Props = {
  workspaces: Workspace[];
  initialWorkspaceId: string | null;
  initialTests: PromptTest[];
  initialUsage: Usage | null;
};

// ─── Risk level helper ────────────────────────────────────────────────────────
// Findings severity overrides the numeric score — a prompt with medium/high
// findings can never be labelled "Safe" regardless of its score.

type RiskLevel = "safe" | "low-risk" | "moderate" | "critical";

function getRiskLevel(score: number, findings: Finding[]): RiskLevel {
  const hasHigh   = findings.some((f) => f.severity === "high");
  const hasMedium = findings.some((f) => f.severity === "medium");
  const hasLow    = findings.some((f) => f.severity === "low");

  if (hasHigh   || score < 40)  return "critical";
  if (hasMedium || score < 65)  return "moderate";
  if (hasLow    || score < 80)  return "low-risk";
  return "safe";
}

const LEVEL_CFG: Record<RiskLevel, { ring: string; bg: string; text: string; label: string }> = {
  safe:     { ring: "ring-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Safe"     },
  "low-risk": { ring: "ring-sky-500/40",   bg: "bg-sky-500/10",    text: "text-sky-400",    label: "Low Risk" },
  moderate: { ring: "ring-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-400",   label: "At Risk"  },
  critical: { ring: "ring-red-500/40",     bg: "bg-red-500/10",     text: "text-red-400",     label: "Critical" },
};

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatUtcDateTime(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  const hour = pad2(date.getUTCHours());
  const minute = pad2(date.getUTCMinutes());

  return `${year}-${month}-${day} ${hour}:${minute} UTC`;
}

function formatUtcDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());

  return `${year}-${month}-${day}`;
}

// ─── Reusable UI atoms ────────────────────────────────────────────────────────

function ScoreRing({ score, findings }: { score: number; findings: Finding[] }) {
  const level = getRiskLevel(score, findings);
  const cfg   = LEVEL_CFG[level];

  return (
    <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full ring-2 ${cfg.ring} ${cfg.bg}`}>
      <span className={`text-2xl font-black leading-none ${cfg.text}`}>{score}</span>
      <span className={`mt-0.5 text-[9px] font-bold uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    high:   "bg-red-500/15   text-red-400   border-red-500/25",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    low:    "bg-blue-500/15  text-blue-400  border-blue-500/25",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[severity] ?? styles.low}`}>
      {severity}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Workspace["plan"] }) {
  const styles: Record<Workspace["plan"], string> = {
    FREE:     "bg-zinc-700/60    text-zinc-400   border-zinc-600/40",
    PRO:      "bg-amber-500/15   text-amber-400  border-amber-500/25",
    BUSINESS: "bg-violet-500/15  text-violet-400 border-violet-500/25",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[plan]}`}>
      {plan}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${accent ?? "text-zinc-100"}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-zinc-600">{sub}</p> : null}
    </div>
  );
}

// ─── Result sub-components ────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-zinc-200">{finding.category}</span>
        <SeverityBadge severity={finding.severity} />
      </div>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{finding.explanation}</p>
      <p className="mt-1 text-xs text-zinc-500">
        <span className="font-semibold text-zinc-400">Fix: </span>
        {finding.recommendation}
      </p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CategoriesGrid({ categories }: { categories: CategoryResult[] }) {
  const domainGroups: Record<string, CategoryResult[]> = {
    security: [],
    "safety-ethics": [],
    quality: [],
  };

  for (const cat of categories) {
    domainGroups[cat.domain].push(cat);
  }

  const domainLabels: Record<string, string> = {
    security: "Security",
    "safety-ethics": "Safety & Ethics",
    quality: "Quality",
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Test Categories</h4>
      {(Object.keys(domainGroups) as Array<keyof typeof domainGroups>).map((domain) => (
        <div key={domain}>
          <p className="mb-2 text-[10px] font-semibold text-zinc-500">{domainLabels[domain]}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {domainGroups[domain].map((cat) => (
              <div
                key={cat.category}
                className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-xs ${
                  cat.passed
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <span
                  className={`shrink-0 font-bold ${
                    cat.passed ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {cat.passed ? "✓" : "✗"}
                </span>
                <span className="text-zinc-300">{cat.category}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function exportReportPdf(test: PromptTest) {
  if (typeof window === "undefined") return;

  posthog.capture("scan_report_exported", {
    finding_count: test.findings.length,
    score: test.score,
  });

  const reportTitle = `Prompt Safety Report - ${new Date(test.createdAt).toLocaleString()}`;
  const level = getRiskLevel(test.score, test.findings);
  const levelLabel = LEVEL_CFG[level].label;
  const severityCounts = {
    high: test.findings.filter((f) => f.severity === "high").length,
    medium: test.findings.filter((f) => f.severity === "medium").length,
    low: test.findings.filter((f) => f.severity === "low").length,
  };

  const levelChipClass: Record<RiskLevel, string> = {
    safe: "chip-safe",
    "low-risk": "chip-low",
    moderate: "chip-moderate",
    critical: "chip-critical",
  };

  const domainLabel: Record<CategoryResult["domain"], string> = {
    security: "Security",
    "safety-ethics": "Safety & Ethics",
    quality: "Quality",
  };

  const severityClass = (severity: string) => {
    if (severity === "high") return "sev-high";
    if (severity === "medium") return "sev-medium";
    return "sev-low";
  };

  const findings = test.findings.length
    ? test.findings
        .map(
          (f) => `
            <article class="finding-card">
              <div class="finding-top">
                <h4>${escapeHtml(f.category)}</h4>
                <span class="severity-pill ${severityClass(f.severity)}">${escapeHtml(f.severity.toUpperCase())}</span>
              </div>
              <p class="finding-text">${escapeHtml(f.explanation)}</p>
              <p class="fix-text"><strong>Fix:</strong> ${escapeHtml(f.recommendation)}</p>
            </article>
          `
        )
        .join("")
    : `
      <div class="empty-state">
        <p>No vulnerabilities detected. This prompt looks healthy across the tested categories.</p>
      </div>
    `;

  const categories = test.categoriesChecked?.length
    ? test.categoriesChecked
        .map(
          (c) => `
            <li class="category-item ${c.passed ? "pass" : "fail"}">
              <span class="mark">${c.passed ? "✓" : "✗"}</span>
              <span class="category-name">${escapeHtml(c.category)}</span>
              <span class="domain-tag">${escapeHtml(domainLabel[c.domain])}</span>
            </li>
          `
        )
        .join("")
    : "";

  const improvedPrompt = test.improvedPrompt
    ? `
      <section class="section">
        <div class="section-head">
          <h3>Suggested rewrite</h3>
          <span class="hint">Ready to copy</span>
        </div>
        <pre>${escapeHtml(test.improvedPrompt)}</pre>
      </section>
    `
    : "";

  const popup = window.open("about:blank", "_blank", "width=980,height=760");
  if (!popup) return;

  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(reportTitle)}</title>
        <style>
          :root {
            --ink: #0f172a;
            --muted: #475569;
            --line: #e2e8f0;
            --paper: #ffffff;
            --canvas: #f8fafc;
            --safe: #059669;
            --low: #0284c7;
            --moderate: #d97706;
            --critical: #dc2626;
          }
          * { box-sizing: border-box; }
          @page { size: A4; margin: 14mm; }
          body {
            margin: 0;
            font-family: "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
            color: var(--ink);
            background: linear-gradient(180deg, #fff 0%, var(--canvas) 100%);
            line-height: 1.45;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .wrap { padding: 22px; }
          .hero {
            border: 1px solid var(--line);
            background: var(--paper);
            border-radius: 16px;
            padding: 16px 18px;
          }
          .brand-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .shield {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: #fbbf24;
            color: #1c1917;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .brand-name {
            font-size: 13px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 700;
          }
          .title-row {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          h1 {
            margin: 0;
            font-size: 25px;
            letter-spacing: -0.02em;
            line-height: 1.15;
          }
          .risk-chip {
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            border: 1px solid;
          }
          .chip-safe { color: var(--safe); border-color: #86efac; background: #f0fdf4; }
          .chip-low { color: var(--low); border-color: #93c5fd; background: #eff6ff; }
          .chip-moderate { color: var(--moderate); border-color: #fcd34d; background: #fffbeb; }
          .chip-critical { color: var(--critical); border-color: #fca5a5; background: #fef2f2; }
          .meta {
            margin-top: 8px;
            font-size: 12px;
            color: var(--muted);
          }
          .kpis {
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }
          .kpi {
            border: 1px solid var(--line);
            border-radius: 12px;
            background: #fff;
            padding: 10px;
          }
          .kpi .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            font-weight: 700;
          }
          .kpi .value {
            margin-top: 4px;
            font-size: 26px;
            line-height: 1;
            font-weight: 800;
          }
          .kpi .sub {
            margin-top: 3px;
            font-size: 11px;
            color: var(--muted);
          }
          .section {
            margin-top: 14px;
            border: 1px solid var(--line);
            border-radius: 14px;
            background: #fff;
            padding: 14px;
          }
          .section-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 8px;
          }
          .section h3 {
            margin: 0;
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #334155;
          }
          .hint {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
          }
          .summary {
            margin: 0;
            font-size: 14px;
            color: #0f172a;
          }
          .categories {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .category-item {
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 8px 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            background: #fff;
          }
          .category-item.pass {
            background: #f0fdf4;
            border-color: #bbf7d0;
          }
          .category-item.fail {
            background: #fef2f2;
            border-color: #fecaca;
          }
          .mark { font-weight: 800; }
          .category-name {
            flex: 1;
            font-size: 12px;
            color: #0f172a;
            font-weight: 600;
          }
          .domain-tag {
            font-size: 10px;
            color: #64748b;
            border: 1px solid var(--line);
            border-radius: 999px;
            padding: 2px 6px;
            background: #f8fafc;
          }
          .findings { display: grid; gap: 10px; }
          .finding-card {
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 10px 12px;
            background: #fff;
          }
          .finding-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .finding-top h4 {
            margin: 0;
            font-size: 14px;
          }
          .severity-pill {
            border-radius: 999px;
            font-size: 10px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 800;
            border: 1px solid;
            padding: 3px 7px;
          }
          .sev-high { color: var(--critical); border-color: #fca5a5; background: #fef2f2; }
          .sev-medium { color: var(--moderate); border-color: #fcd34d; background: #fffbeb; }
          .sev-low { color: var(--low); border-color: #93c5fd; background: #eff6ff; }
          .finding-text, .fix-text {
            margin: 7px 0 0;
            font-size: 12px;
            color: #334155;
          }
          .fix-text strong { color: #0f172a; }
          .empty-state {
            border: 1px dashed #86efac;
            border-radius: 10px;
            padding: 10px;
            background: #f0fdf4;
            color: #166534;
            font-size: 13px;
          }
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            background: #0f172a;
            color: #e2e8f0;
            border-radius: 10px;
            padding: 10px;
            font: 12px/1.45 "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
          }
          .footer {
            margin-top: 10px;
            text-align: right;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <main class="wrap">
          <section class="hero">
            <div class="brand-row">
              <span class="shield" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L2 4v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V4L8 1z" fill="currentColor" fill-opacity=".25" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                  <path d="M5.5 8.5l1.8 1.8 3.2-3.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="brand-name">TestMyPrompt</span>
            </div>
            <div class="title-row">
              <h1>Prompt Safety Report</h1>
              <span class="risk-chip ${levelChipClass[level]}">${escapeHtml(levelLabel)}</span>
            </div>
            <p class="meta">Scan time: ${escapeHtml(new Date(test.createdAt).toLocaleString())}</p>
            <div class="kpis">
              <div class="kpi">
                <div class="label">Risk score</div>
                <div class="value">${test.score}</div>
                <div class="sub">Out of 100</div>
              </div>
              <div class="kpi">
                <div class="label">Findings</div>
                <div class="value">${test.findings.length}</div>
                <div class="sub">Total issues</div>
              </div>
              <div class="kpi">
                <div class="label">High severity</div>
                <div class="value">${severityCounts.high}</div>
                <div class="sub">Critical focus</div>
              </div>
              <div class="kpi">
                <div class="label">Categories</div>
                <div class="value">${test.categoriesChecked?.length ?? 0}</div>
                <div class="sub">Checks executed</div>
              </div>
            </div>
          </section>

          <section class="section">
            <div class="section-head">
              <h3>Executive summary</h3>
            </div>
            <p class="summary">${escapeHtml(test.summary)}</p>
          </section>

          <section class="section">
            <div class="section-head">
              <h3>Categories checked</h3>
              <span class="hint">Pass or issue</span>
            </div>
            <ul class="categories">${categories || "<li class='category-item'><span class='category-name'>No category details available.</span></li>"}</ul>
          </section>

          <section class="section">
            <div class="section-head">
              <h3>Findings</h3>
              <span class="hint">Actionable remediation included</span>
            </div>
            <div class="findings">${findings}</div>
          </section>

          ${improvedPrompt}

          <p class="footer">Generated ${escapeHtml(new Date().toLocaleString())}</p>
        </main>
      </body>
    </html>
  `);

  popup.document.close();
  popup.focus();
  popup.onload = () => {
    popup.print();
  };
}

function TestResult({ test }: { test: PromptTest }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <ScoreRing score={test.score} findings={test.findings} />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-zinc-300">{test.summary}</p>
          <p className="mt-1 text-xs text-zinc-600">
            {formatUtcDateTime(test.createdAt)}
          </p>
          <button
            type="button"
            onClick={() => exportReportPdf(test)}
            className="mt-2 rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            Export PDF
          </button>
        </div>
      </div>
      {test.findings.length > 0 ? (
        <div className="space-y-2">
          {test.findings.map((f) => <FindingCard key={f.id} finding={f} />)}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
          <span>✓</span> No vulnerabilities detected
        </div>
      )}
      {test.categoriesChecked && test.categoriesChecked.length > 0 ? (
        <CategoriesGrid categories={test.categoriesChecked} />
      ) : null}
      {test.improvedPrompt ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between border-b border-emerald-500/15 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">✦</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Suggested rewrite
              </span>
            </div>
            <CopyButton text={test.improvedPrompt} />
          </div>
          <pre className="overflow-auto whitespace-pre-wrap break-words px-3 py-3 font-mono text-xs leading-relaxed text-emerald-100/80">
            {test.improvedPrompt}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function HistoryRow({ test }: { test: PromptTest }) {
  const [open, setOpen] = useState(false);
  const level = getRiskLevel(test.score, test.findings);
  const color = LEVEL_CFG[level].text;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 p-4 text-left">
        <span className={`w-12 shrink-0 text-2xl font-black ${color}`}>{test.score}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-zinc-300">{test.summary}</p>
          <p className="text-xs text-zinc-600">
            {formatUtcDateTime(test.createdAt)}
          </p>
        </div>
        <span className="shrink-0 text-xs text-zinc-600">{test.findings.length} finding{test.findings.length !== 1 ? "s" : ""}</span>
        <span className="shrink-0 text-xs text-zinc-600">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => exportReportPdf(test)}
              className="rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              Export PDF
            </button>
          </div>
          {test.findings.length === 0
            ? <p className="text-xs text-emerald-400">No vulnerabilities detected</p>
            : <div className="space-y-2">
                {test.findings.map((f) => <FindingCard key={f.id} finding={f} />)}
              </div>}
          {test.categoriesChecked && test.categoriesChecked.length > 0 ? (
            <CategoriesGrid categories={test.categoriesChecked} />
          ) : null}
          {test.improvedPrompt ? (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between border-b border-emerald-500/15 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✦</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Suggested rewrite</span>
                </div>
                <CopyButton text={test.improvedPrompt} />
              </div>
              <pre className="overflow-auto whitespace-pre-wrap break-words px-3 py-3 font-mono text-xs leading-relaxed text-emerald-100/80">
                {test.improvedPrompt}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardClient({ workspaces, initialWorkspaceId, initialTests, initialUsage }: Props) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab]       = useState<Tab>("scanner");
  const [workspaceId, setWorkspaceId]   = useState(initialWorkspaceId ?? "");
  const [prompt, setPrompt]             = useState("");
  const [tests, setTests]               = useState<PromptTest[]>(initialTests);
  const [usage, setUsage]               = useState<Usage | null>(initialUsage);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [memberEmail, setMemberEmail]   = useState("");
  const [memberSuccess, setMemberSuccess] = useState(false);
  const [latestTest, setLatestTest]     = useState<PromptTest | null>(null);
  // API token state
  const [tokens, setTokens]             = useState<ApiTokenRow[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const activeWorkspace = useMemo(() => workspaces.find((w) => w.id === workspaceId), [workspaces, workspaceId]);
  const apiFeaturesEnabled = activeWorkspace?.plan === "PRO" || activeWorkspace?.plan === "BUSINESS";
  const avgScore        = useMemo(() => tests.length ? Math.round(tests.reduce((s, t) => s + t.score, 0) / tests.length) : null, [tests]);
  const highRiskCount   = useMemo(() => tests.filter((t) => t.score < 40).length, [tests]);

  async function loadTests(id: string) {
    const res = await fetch(`/api/tests?workspaceId=${id}`);
    if (!res.ok) { setError("Unable to load test history"); return; }
    const data = await res.json();
    setTests(data.tests ?? []);
    setUsage(data.usage ?? null);
  }

  async function runTest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspaceId) { setError("Select a workspace first"); return; }
    setLoading(true); setError(null);
    const res  = await fetch("/api/tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId, prompt }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to score prompt"); return; }
    setPrompt(""); setLatestTest(data.test);
    setTests((prev) => [data.test, ...prev]);
    setUsage(data.usage ?? null);
    posthog.capture("prompt_scan_completed", {
      finding_count: data.test.findings.length,
      score: data.test.score,
      workspace_id: workspaceId,
    });
  }

  async function createWorkspace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const res = await fetch("/api/workspaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: workspaceName, slug: workspaceSlug }) });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return; }
    const data = await res.json();
    posthog.capture("workspace_created", {
      workspace_id: data.workspace.id,
      plan: data.workspace.plan,
    });
    window.location.reload();
  }

  async function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMemberSuccess(false);
    if (!workspaceId) { setError("Select a workspace first"); return; }
    const res  = await fetch(`/api/workspaces/${workspaceId}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: memberEmail, role: "MEMBER" }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to add member"); return; }
    setMemberEmail(""); setMemberSuccess(true);
    posthog.capture("workspace_member_added", {
      workspace_id: workspaceId,
      role: "MEMBER",
    });
  }

  async function loadTokens(wsId: string) {
    const res = await fetch(`/api/tokens?workspaceId=${wsId}`);
    if (!res.ok) { setError("Unable to load API tokens"); return; }
    const data = await res.json();
    setTokens(data.tokens ?? []);
  }

  async function createToken(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspaceId) { setError("Select a workspace first"); return; }
    setTokenLoading(true);
    const res  = await fetch("/api/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId, name: newTokenName }) });
    const data = await res.json();
    setTokenLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to create token"); return; }
    setNewTokenName("");
    setRevealedToken(data.rawToken);
    setTokens((prev) => [data.token, ...prev]);
  }

  async function revokeToken(tokenId: string) {
    const res = await fetch(`/api/tokens/${tokenId}`, { method: "DELETE" });
    if (!res.ok) { setError("Failed to revoke token"); return; }
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
  }

  async function startCheckout(plan: "PRO" | "BUSINESS") {
    if (!workspaceId) { setError("Select a workspace first"); return; }
    const res  = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId, plan }) });
    const data = await res.json();
    if (!res.ok || !data.url) { setError(data.error ?? "Unable to start checkout"); return; }
    posthog.capture("checkout_started", {
      plan,
      workspace_id: workspaceId,
    });
    window.location.href = data.url;
  }

  async function openBillingPortal() {
    if (!workspaceId) { setError("Select a workspace first"); return; }
    const res  = await fetch("/api/billing/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId }) });
    const data = await res.json();
    if (!res.ok || !data.url) { setError(data.error ?? "Unable to open portal"); return; }
    posthog.capture("billing_portal_opened", {
      workspace_id: workspaceId,
    });
    window.location.href = data.url;
  }

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "scanner",   label: "Scanner",   icon: Terminal    },
    { id: "history",   label: "History",   icon: Clock       },
    { id: "workspace", label: "Workspace", icon: Users       },
    { id: "billing",   label: "Billing",   icon: CreditCard  },
    ...(apiFeaturesEnabled ? [{ id: "api" as Tab, label: "API", icon: Zap }] : []),
  ];

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">

        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1L2 4v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V4L8 1z" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M5.5 8.5l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-black tracking-tight text-white">TestMyPrompt</span>
        </div>

        {/* Workspace picker */}
        <div className="border-b border-zinc-800 px-3 py-3">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Workspace
          </label>
          <select
            value={workspaceId}
            onChange={(e) => { const id = e.target.value; setWorkspaceId(id); if (id) void loadTests(id); }}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          >
            <option value="">Select workspace</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
          {activeWorkspace ? (
            <div className="mt-2"><PlanBadge plan={activeWorkspace.plan} /></div>
          ) : null}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                if (id === "api" && workspaceId) void loadTokens(workspaceId);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Usage bar */}
        {usage ? (
          <div className="border-t border-zinc-800 px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-500">
              <span className="font-semibold uppercase tracking-widest">Usage</span>
              <span>{usage.used}/{usage.limit}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* User row */}
        <div className="flex items-center gap-2 border-t border-zinc-800 px-3 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
            {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-300">
              {session?.user?.name ?? session?.user?.email ?? "—"}
            </p>
          </div>
          <button
            type="button"
            title="Sign out"
            onClick={() => {
              posthog.capture("user_signed_out");
              posthog.reset();
              void signOut({ callbackUrl: "/" });
            }}
            className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">

        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-3">
          <div>
            <h1 className="text-sm font-bold capitalize text-zinc-100">{activeTab}</h1>
            <p className="text-xs text-zinc-500">
              {activeTab === "scanner"   && "Paste a prompt and run a vulnerability scan"}
              {activeTab === "history"   && "All test runs for this workspace"}
              {activeTab === "workspace" && "Members and workspace settings"}
              {activeTab === "billing"   && "Plan, usage limits and subscription"}
              {activeTab === "api"       && "API keys and integration docs"}
            </p>
          </div>
          {activeTab === "scanner" && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1">
              <Zap size={11} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">AI-powered</span>
            </div>
          )}
        </header>

        {/* Error banner */}
        {error ? (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            <ShieldAlert size={14} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-400/60 hover:text-red-300">✕</button>
          </div>
        ) : null}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Scanner ──────────────────────────────────────────────────── */}
          {activeTab === "scanner" && (
            <div className="space-y-5 p-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Tests this month"  value={usage ? `${usage.used}/${usage.limit}` : "—"} sub={usage ? `${usage.remaining} remaining` : undefined} />
                <StatCard label="Avg score"         value={avgScore !== null ? avgScore : "—"} accent={avgScore === null ? undefined : avgScore >= 80 ? "text-emerald-400" : avgScore >= 65 ? "text-sky-400" : avgScore >= 40 ? "text-amber-400" : "text-red-400"} />
                <StatCard label="High risk scans"   value={highRiskCount} sub="score below 40" accent={highRiskCount > 0 ? "text-red-400" : "text-zinc-100"} />
                <StatCard label="Total scans"       value={tests.length} sub="in this workspace" />
              </div>

              {/* Two-column: form | result */}
              <div className="grid gap-4 xl:grid-cols-2">
                {/* Input form */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">New scan</p>
                  <form onSubmit={runTest} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-500">Prompt to evaluate</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Paste the system prompt or instruction set you want to red-team…"
                        className="min-h-44 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !workspaceId}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-zinc-900 transition-opacity disabled:opacity-50"
                    >
                      {loading ? (
                        <><Settings2 size={14} className="animate-spin" /> Analysing…</>
                      ) : (
                        <><Zap size={14} /> Run vulnerability scan</>
                      )}
                    </button>
                    {!workspaceId && <p className="text-center text-xs text-zinc-500">Select a workspace to enable scanning</p>}
                  </form>
                </div>

                {/* Latest result */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Latest result</p>
                  {latestTest ?? tests[0] ? (
                    <TestResult test={(latestTest ?? tests[0])!} />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 text-zinc-600">
                      <Terminal size={22} />
                      <p className="text-sm">Run a scan to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── History ──────────────────────────────────────────────────── */}
          {activeTab === "history" && (
            <div className="p-6">
              <p className="mb-4 text-xs text-zinc-500">{tests.length} scans</p>
              {tests.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 text-zinc-600">
                  <Clock size={24} />
                  <p className="text-sm">No scans yet in this workspace</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tests.map((t) => <HistoryRow key={t.id} test={t} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Workspace ────────────────────────────────────────────────── */}
          {activeTab === "workspace" && (
            <div className="max-w-2xl space-y-5 p-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Create workspace</p>
                <form onSubmit={createWorkspace} className="space-y-3">
                  <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="Workspace name" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40" required />
                  <input value={workspaceSlug} onChange={(e) => setWorkspaceSlug(e.target.value)} placeholder="workspace-slug (lowercase, no spaces)" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40" required />
                  <button className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-600">Create workspace</button>
                </form>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Add member</p>
                <p className="mb-4 text-xs text-zinc-500">The user must already have a TestMyPrompt account.</p>
                <form onSubmit={addMember} className="flex gap-2">
                  <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="colleague@company.com" className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40" required />
                  <button className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-600">Add</button>
                </form>
                {memberSuccess && <p className="mt-2 text-xs font-semibold text-emerald-400">Member added successfully.</p>}
              </div>

              {/* API tokens — moved to API tab */}

              {/* API usage example — moved to API tab */}
            </div>
          )}

          {/* ── Billing ──────────────────────────────────────────────────── */}
          {activeTab === "billing" && (
            <div className="max-w-3xl space-y-5 p-6">
              {activeWorkspace && (
                <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Current plan</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xl font-black text-zinc-100">{activeWorkspace.plan}</span>
                      <PlanBadge plan={activeWorkspace.plan} />
                    </div>
                  </div>
                  {usage && (
                    <div className="ml-auto text-right">
                      <p className="text-xs text-zinc-500">{usage.used} / {usage.limit} tests used this month</p>
                      <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {([ { plan: "PRO", price: "$29/mo", features: ["20 tests / month", "10 seats", "AI-powered scoring", "Priority support"] }, { plan: "BUSINESS", price: "$99/mo from", features: ["200 tests / month included", "25 seats included", "AI-powered scoring", "Custom tests & seats"] } ] as const).map(({ plan, price, features }) => (
                  <div key={plan} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex items-center justify-between">
                      <PlanBadge plan={plan} />
                      <span className="text-lg font-black text-zinc-100">{price}</span>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <span className="text-amber-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => startCheckout(plan)} className="mt-4 w-full rounded-lg bg-amber-400 py-2 text-sm font-bold text-zinc-900 transition-opacity hover:opacity-90">
                      Upgrade to {plan}
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" onClick={openBillingPortal} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800">
                Manage subscription →
              </button>
            </div>
          )}

          {/* ── API ──────────────────────────────────────────────────────── */}
          {activeTab === "api" && (
            <div className="max-w-3xl space-y-5 p-6">

              {/* Token management */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">API tokens</p>
                <p className="mt-0.5 text-xs text-zinc-500">Tokens authenticate requests to <code className="text-zinc-400">POST /api/v1/test</code>. Treat them like passwords — never commit to source control.</p>

                {revealedToken && (
                  <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Save this now — it won&apos;t be shown again</p>
                      <button type="button" onClick={() => setRevealedToken(null)} className="text-xs text-amber-400/60 hover:text-amber-300">✕</button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 break-all rounded-lg bg-zinc-950 px-3 py-2 font-mono text-xs text-amber-200">{revealedToken}</code>
                      <CopyButton text={revealedToken} />
                    </div>
                  </div>
                )}

                <form onSubmit={createToken} className="mt-4 flex gap-2">
                  <input
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder='Token name e.g. "CI pipeline"'
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
                    required
                  />
                  <button type="submit" disabled={tokenLoading || !workspaceId} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-900 transition-opacity disabled:opacity-50">
                    {tokenLoading ? "…" : "Generate"}
                  </button>
                </form>

                {tokens.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {tokens.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-300">{t.name}</p>
                          <p className="mt-0.5 text-[10px] text-zinc-600">
                            <code className="text-zinc-500">{t.prefix}…</code>
                            {" · "}{t.lastUsedAt ? `Last used ${formatUtcDate(t.lastUsedAt)}` : "Never used"}
                            {" · "}Created {formatUtcDate(t.createdAt)}{t.user.name ? ` by ${t.user.name}` : ""}
                          </p>
                        </div>
                        <button type="button" onClick={() => revokeToken(t.id)} className="ml-4 shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold text-zinc-500 transition-colors hover:border-red-500/40 hover:text-red-400">
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-zinc-600">No tokens yet. Generate one above.</p>
                )}
              </div>

              {/* Quick start */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quick start</p>
                <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-400">{`curl -X POST https://testmyprompt.net/api/v1/test \\
  -H "Authorization: Bearer <YOUR_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "You are a helpful assistant..."
  }'`}</pre>
              </div>

              {/* Request */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Request</p>
                <p className="text-xs text-zinc-400"><span className="font-semibold text-zinc-200">POST</span> <code className="text-amber-300">/api/v1/test</code></p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      <th className="pb-2 pr-4">Field</th><th className="pb-2 pr-4">Type</th><th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {[
                      ["prompt", "string (required)", "The system prompt to analyse. Min 10, max 12 000 characters."],
                    ].map(([field, type, desc]) => (
                      <tr key={field}>
                        <td className="py-2 pr-4 font-mono text-amber-300">{field}</td>
                        <td className="py-2 pr-4 text-zinc-500">{type}</td>
                        <td className="py-2 text-zinc-400">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Response */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Response</p>
                <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-400">{`{
  "id": "cm...",
  "score": 42,
  "level": "Critical",
  "summary": "High injection risk detected...",
  "findings": [
    {
      "category": "Prompt Injection",
      "severity": "high",
      "explanation": "...",
      "recommendation": "..."
    }
  ],
  "improvedPrompt": "You are a helpful assistant...",
  "cached": false,
  "usage": { "used": 3, "limit": 20, "remaining": 17 }
}`}</pre>
              </div>

              {/* Error codes */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Error codes</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      <th className="pb-2 pr-4">Status</th><th className="pb-2">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {[
                      ["401", "Missing or invalid Bearer token."],
                      ["402", "Monthly test limit reached for this workspace."],
                      ["403", "API access not available on your plan."],
                      ["400", "Invalid request body — check prompt length."],
                      ["429", "IP-level rate limit exceeded."],
                    ].map(([code, meaning]) => (
                      <tr key={code}>
                        <td className="py-2 pr-4 font-mono text-red-400">{code}</td>
                        <td className="py-2 text-zinc-400">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CI/CD example */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">GitHub Actions example</p>
                <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-400">{`- name: Check prompt safety
  run: |
    RESPONSE=$(curl -sf -X POST https://testmyprompt.net/api/v1/test \\
      -H "Authorization: Bearer \${{ secrets.TMP_API_KEY }}" \\
      -H "Content-Type: application/json" \\
      -d '{"prompt":"'"$(cat prompt.txt)"'"}')
    SCORE=$(echo $RESPONSE | jq '.score')
    if [ "$SCORE" -lt 60 ]; then
      echo "Prompt safety score $SCORE is below threshold (60). Failing."
      exit 1
    fi`}</pre>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
