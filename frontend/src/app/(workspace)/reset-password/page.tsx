"use client";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, LoadingState, Notice } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
function ResetForm() {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: params.get("token"),
          email: form.get("email"),
          password: form.get("password"),
          password_confirmation: form.get("password_confirmation"),
        }),
      });
      setSuccess(true);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? Object.values(e.errors).flat().join(" ") || e.message
          : "Unable to reset your password.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!params.get("token"))
    return (
      <Notice error>
        This reset link is incomplete.{" "}
        <Link href="/forgot-password">Request a new link.</Link>
      </Notice>
    );
  if (success)
    return (
      <Notice>
        Your password has been reset.{" "}
        <Link href="/login">Sign in to continue.</Link>
      </Notice>
    );
  return (
    <form onSubmit={submit} className="form-stack">
      {error && <Notice error>{error}</Notice>}
      <Field
        id="email"
        label="Email address"
        name="email"
        type="email"
        defaultValue={params.get("email") ?? ""}
        autoComplete="email"
        required
      />
      <Field
        id="password"
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={12}
        maxLength={128}
        required
      />
      <p className="field-hint">
        Use at least 12 characters with uppercase, lowercase, a number and a
        symbol.
      </p>
      <Field
        id="password_confirmation"
        label="Confirm password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        minLength={12}
        maxLength={128}
        required
      />
      <Button loading={busy}>Reset password</Button>
    </form>
  );
}
export default function ResetPassword() {
  return (
    <AuthLayout
      title="Reset your password."
      description="Choose a strong password for your workspace."
    >
      <Suspense fallback={<LoadingState />}>
        <ResetForm />
      </Suspense>
    </AuthLayout>
  );
}
