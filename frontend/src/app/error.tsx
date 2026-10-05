"use client";
import { Button } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="center-state">
      <p className="eyebrow">UNEXPECTED INTERRUPTION</p>
      <h1>Let’s try that again.</h1>
      <p className="muted">The page couldn’t load. Please retry.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
