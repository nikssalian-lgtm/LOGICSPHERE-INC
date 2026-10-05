"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button, Field, Notice } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
export default function ForgotPassword() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      const result = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: data.get("email") }),
      });
      setMessage(result.message);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Unable to send the reset link. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="A fresh start."
      description="Request a secure link to reset your password."
    >
      <form onSubmit={submit} className="form-stack">
        {message && <Notice>{message}</Notice>}
        {error && <Notice error>{error}</Notice>}
        <Field
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          required
          maxLength={254}
        />
        <Button loading={busy}>Send reset link</Button>
        <Link href="/login" className="text-link">
          ← Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
