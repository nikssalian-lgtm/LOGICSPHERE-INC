"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { PublicRecord } from "@/lib/public-content";

export function TechnologyBrowser({ items }: { items: PublicRecord[] }) {
  const groups = useMemo(
    () => [
      "All",
      ...new Set(
        items.map((item) => String(item.attributes.category || "Other")),
      ),
    ],
    [items],
  );
  const [selected, setSelected] = useState("All");
  const visible =
    selected === "All"
      ? items
      : items.filter(
          (item) => String(item.attributes.category || "Other") === selected,
        );
  return (
    <>
      <div
        className="technology-filters"
        role="group"
        aria-label="Filter technologies"
      >
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            aria-pressed={selected === group}
            onClick={() => setSelected(group)}
          >
            {group}
          </button>
        ))}
      </div>
      <div className="technology-directory">
        {visible.map((item) => {
          const href = String(item.attributes.website ?? "");
          return (
            <article className="technology-card" key={item.id}>
              <span className="technology-mark">
                {String(item.attributes.mark || item.title.slice(0, 2)).slice(
                  0,
                  4,
                )}
              </span>
              <div>
                <p className="eyebrow">
                  {String(item.attributes.category || "TECHNOLOGY")}
                </p>
                <h2>{item.title}</h2>
                {item.summary && <p>{item.summary}</p>}
              </div>
              {/^https:\/\//.test(href) && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${item.title} documentation`}
                >
                  <ArrowUpRight size={15} />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
