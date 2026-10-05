"use client";

import { useState } from "react";
import {
  Activity,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  Package,
  UsersRound,
} from "lucide-react";
import type { PublicRecord } from "@/lib/public-content";

const moduleNames = [
  "Sales",
  "Inventory",
  "Purchasing",
  "Accounts",
  "People",
  "Reports",
];
const iconList = [
  Activity,
  Package,
  ClipboardList,
  CircleDollarSign,
  UsersRound,
  Boxes,
];
const options = ["ERP", "CRM", "POS"];

export function SolutionsShowcase({
  solutions,
}: {
  solutions: PublicRecord[];
}) {
  const [selected, setSelected] = useState(options[0]);
  const active = solutions.find(
    (item) =>
      String(item.attributes.category ?? "").toLowerCase() ===
      selected.toLowerCase(),
  );
  const title = active?.title ?? `${selected} system`;
  const description =
    active?.summary ??
    "A configurable software concept, shaped around the needs and workflows of the business.";
  return (
    <section
      className="software-showcase section-wrap"
      aria-labelledby="software-showcase-title"
    >
      <div className="showcase-heading">
        <div>
          <p className="eyebrow">BUSINESS SOFTWARE / ILLUSTRATIVE INTERFACE</p>
          <h2 id="software-showcase-title">
            A clearer view
            <br />
            of <em>the operation.</em>
          </h2>
          <p>
            Explore a conceptual interface for connected business software. It
            illustrates a possible direction, not a live or packaged LogicSphere
            product.
          </p>
        </div>
        <div
          className="showcase-tabs"
          role="group"
          aria-label="Business software category"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={selected === option}
              onClick={() => setSelected(option)}
            >
              {option}
              <span>
                {solutions.some(
                  (item) =>
                    String(item.attributes.category ?? "").toLowerCase() ===
                    option.toLowerCase(),
                )
                  ? "CMS"
                  : "CONCEPT"}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div
        className="business-dashboard"
        aria-label={`${selected} interface concept`}
        aria-live="polite"
      >
        <div className="dashboard-topbar">
          <span className="dashboard-brand">
            <b>LS</b> / {title.toUpperCase()}
          </span>
          <span className="dashboard-status">
            <i /> INTERFACE CONCEPT
          </span>
          <span className="dashboard-user">LS</span>
        </div>
        <div className="dashboard-body">
          <nav
            className="dashboard-side"
            aria-label="Illustrative software modules"
          >
            {moduleNames.map((name, i) => {
              const Icon = iconList[i];
              return (
                <span className={i === 0 ? "selected" : ""} key={name}>
                  <Icon size={14} />
                  {name}
                </span>
              );
            })}
          </nav>
          <div className="dashboard-main">
            <div className="dashboard-title">
              <div>
                <p className="eyebrow">OVERVIEW / {selected}</p>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span>PERIOD / —</span>
            </div>
            <div className="dashboard-metrics">
              {[
                ["ACTIVITY", Activity],
                ["WORKFLOWS", ClipboardList],
                ["RESOURCES", Boxes],
                ["INSIGHTS", CircleDollarSign],
              ].map(([label, Icon], i) => {
                const MetricIcon = Icon as typeof Activity;
                return (
                  <div key={String(label)}>
                    <span>
                      <MetricIcon size={13} /> {String(label)}
                    </span>
                    <b>—</b>
                    <small>
                      {i === 0
                        ? "Configured to project"
                        : "Illustrative module"}
                    </small>
                  </div>
                );
              })}
            </div>
            <div className="dashboard-lower">
              <div className="dashboard-chart">
                <p>
                  ACTIVITY OVERVIEW <span>ILLUSTRATIVE</span>
                </p>
                <div className="chart-lines">
                  <i />
                  <i />
                  <i />
                  <svg
                    viewBox="0 0 500 120"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M0 91 C40 86 50 74 82 81 S132 55 165 66 S210 42 248 55 S305 31 340 45 S395 27 420 37 S467 16 500 20" />
                  </svg>
                </div>
              </div>
              <div className="dashboard-checklist">
                <p>WORKSPACE / PREVIEW</p>
                <span>
                  <i /> Sales & customer workflows
                </span>
                <span>
                  <i /> Shared operational data
                </span>
                <span>
                  <i /> Reports & visibility
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="showcase-disclaimer">
        Screen labels and values are illustrative placeholders. They do not
        represent a deployed product or customer data.
      </p>
    </section>
  );
}
