"use client";
import { useState } from "react";
import { Button, Field, Notice, Panel } from "@/components/ui";
export default function DesignSystem() {
  const [message, setMessage] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONSISTENCY BY DESIGN</p>
          <h1>The visual foundation.</h1>
          <p className="muted">
            Shared tokens and accessible interface components.
          </p>
        </div>
      </div>
      <Panel>
        <h2>Brand palette</h2>
        <div className="swatches">
          {[
            ["Brand cyan", "#00AFEF", "brand"],
            ["Ink", "#080B0E", "ink"],
            ["White", "#FFFFFF", "white"],
            ["Logo charcoal", "#373435", "charcoal"],
          ].map(([name, hex, cls]) => (
            <div key={name}>
              <div className={`swatch ${cls}`} />
              <strong>{name}</strong>
              <small>{hex}</small>
            </div>
          ))}
        </div>
      </Panel>
      <div className="dashboard-grid">
        <Panel>
          <p className="eyebrow">TYPE / INTERFACE</p>
          <h2>Clarity at every scale.</h2>
          <p className="muted">
            A restrained system of expressive headings, readable body text and
            precise interface labels.
          </p>
          <div className="component-actions">
            <Button
              onClick={() =>
                setMessage("Primary button interaction confirmed.")
              }
            >
              Primary action
            </Button>
            <Button
              className="secondary"
              onClick={() =>
                setMessage("Secondary button interaction confirmed.")
              }
            >
              Secondary
            </Button>
            <Button disabled>Disabled</Button>
          </div>
          {message && <Notice>{message}</Notice>}
        </Panel>
        <Panel>
          <h2>Form controls</h2>
          <Field
            label="Example field"
            id="example"
            placeholder="Enter a value"
          />
          <Field
            label="Validation example"
            id="invalid-example"
            error="An inline error identifies the field and explains the issue."
            defaultValue="Example"
          />
          <p className="field-hint">
            These are component examples; no data is submitted.
          </p>
        </Panel>
      </div>
    </>
  );
}
