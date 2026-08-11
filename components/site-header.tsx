"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import posthog from "posthog-js";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const { status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canUseDOM = typeof window !== "undefined";

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-stone-900">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1L2 4v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V4L8 1z" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M5.5 8.5l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-stone-900">TestMyPrompt</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-500 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
                  onClick={() => setIsMenuOpen(false)}
              className="transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-2">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    posthog.capture("user_signed_out");
                    posthog.reset();
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="rounded-full border border-stone-200 px-4 py-1.5 text-sm font-semibold text-stone-700 hover:border-stone-300 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="rounded-full border border-stone-200 px-4 py-1.5 text-sm font-semibold text-stone-700 hover:border-stone-300 transition-colors">
                  Sign in
                </Link>
                <Link href="/sign-up" className="rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-stone-900 hover:bg-amber-300 transition-colors">
                  Start trial
                </Link>
              </>
            )}
          </div>
        </nav>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-site-menu"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900 transition-colors hover:border-stone-300 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="flex h-4 w-5 flex-col justify-between">
            <span
              className={`block h-0.5 rounded-full bg-current transition-transform duration-300 ${
                isMenuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 rounded-full bg-current transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 rounded-full bg-current transition-transform duration-300 ${
                isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {canUseDOM
        ? createPortal(
            <div
              className={`md:hidden ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
              aria-hidden={!isMenuOpen}
            >
              <div
                id="mobile-site-menu"
                className={`fixed inset-0 z-[60] origin-top overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(248,246,242,0.97))] text-stone-900 transition duration-300 ${
                  isMenuOpen
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-4 scale-[0.98] opacity-0"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.24),transparent_38%),radial-gradient(circle_at_left_center,rgba(28,25,23,0.06),transparent_32%)]" />
                <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-8 pt-6">
                  <div className="flex items-start justify-between gap-4 border-b border-stone-200/70 pb-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
                        Navigation
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close navigation menu"
                      onClick={() => setIsMenuOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-stone-700 transition-colors hover:border-stone-300"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M3 3l8 8M11 3 3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {navLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center justify-between rounded-2xl border border-stone-200/70 bg-white/70 px-5 py-4 transition duration-300 hover:border-stone-300 hover:bg-white"
                        style={{ transitionDelay: isMenuOpen ? `${index * 45}ms` : "0ms" }}
                      >
                        <span className="text-lg font-semibold text-stone-900">{link.label}</span>
                        <span className="text-stone-400 transition-transform duration-300 group-hover:translate-x-1">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M3.5 8h8m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="grid gap-3 rounded-[1.5rem] border border-stone-200/80 bg-stone-950 px-4 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      {status === "authenticated" ? (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-300"
                          >
                            Open dashboard
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              posthog.capture("user_signed_out");
                              posthog.reset();
                              void signOut({ callbackUrl: "/" });
                            }}
                            className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/25"
                          >
                            Sign out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/sign-up"
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-300"
                          >
                            Start trial
                          </Link>
                          <Link
                            href="/sign-in"
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/25"
                          >
                            Sign in
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </header>
  );
}
