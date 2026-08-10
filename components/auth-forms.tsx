"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="********"
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-stone-50 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const registerRes = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, workspaceName, email, password }),
    });

    if (!registerRes.ok) {
      setLoading(false);
      setError("Unable to create account");
      return;
    }

    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (loginRes?.error) {
      setError("Account created, but sign in failed. Try signing in manually.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Alex Rivera"
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
      />
      <input
        type="text"
        required
        value={workspaceName}
        onChange={(event) => setWorkspaceName(event.target.value)}
        placeholder="Workspace name"
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Use 8+ characters"
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-stone-900 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
