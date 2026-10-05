"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await api<{
        data: { reference: string };
        message: string;
      }>("/enquiries", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          privacy_consent: data.privacy_consent === "on",
        }),
      });
      setReference(response.data.reference);
      form.reset();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "We could not send your message. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="contact-success" role="status">
        <CheckCircle2 size={28} />
        <p className="eyebrow">MESSAGE RECEIVED</p>
        <h2>Thank you for reaching out.</h2>
        <p>
          Your reference is <strong>{reference}</strong>. Your message has been
          sent to the LogicSphere team.
        </p>
        <button
          type="button"
          className="text-link"
          onClick={() => setReference("")}
        >
          Send another message
        </button>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form-intro">
        <p className="eyebrow">TELL US WHAT YOU’RE THINKING</p>
        <h2>Start a conversation.</h2>
        <p>Share a little context. We’ll take it from there.</p>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-grid">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
          />
        </label>
        <label>
          Work email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <label>
          Phone <span>(optional)</span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
        <label>
          Company <span>(optional)</span>
          <input name="company" autoComplete="organization" maxLength={160} />
        </label>
        <label>
          What can we help with?
          <select name="project_type" defaultValue="">
            <option value="">Select a project type</option>
            {[
              "Custom software",
              "ERP development",
              "CRM development",
              "POS software",
              "Website development",
              "E-commerce",
              "Mobile application",
              "API / integrations",
              "Other",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Indicative budget <span>(optional)</span>
          <select name="budget" defaultValue="">
            <option value="">Select a range</option>
            {[
              "To be discussed",
              "Under 10,000",
              "10,000 – 25,000",
              "25,000 – 50,000",
              "50,000+",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="form-full">
          Tell us about the project
          <textarea
            name="message"
            rows={5}
            required
            minLength={20}
            maxLength={10000}
            placeholder="The challenge, opportunity, timeline or anything else that would help us understand…"
          />
        </label>
      </div>
      <label className="consent-check">
        <input name="privacy_consent" type="checkbox" required />
        <span>
          I agree that LogicSphere Inc may use these details to respond to my
          enquiry.
        </span>
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send your enquiry"}
        <ArrowUpRight size={16} />
      </button>
      <p className="form-privacy">
        Your information is used to respond to this request.
      </p>
    </form>
  );
}
