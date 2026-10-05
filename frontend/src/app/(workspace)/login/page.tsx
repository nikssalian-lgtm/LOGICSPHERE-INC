"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Notice } from "@/components/ui";
import { ApiError } from "@/lib/api";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      router.replace("/admin");
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="Welcome back."
      description="Sign in to your LogicSphere workspace."
    >
      <form onSubmit={submit} className="form-stack">
        {error && <Notice error>{error}</Notice>}
        <Field
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="username"
          required
          maxLength={254}
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
        <Link href="/forgot-password" className="text-link forgot-link">
          Forgot your password?
        </Link>
        <Button type="submit" loading={busy}>
          Sign in to workspace
        </Button>
      </form>
      <p className="auth-help">Access is limited to authorized team members.</p>
      <Link href="/" className="text-link">
        ← Back to website
      </Link>
    </AuthLayout>
  );
}
