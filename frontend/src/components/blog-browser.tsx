"use client";
import { useMemo, useState } from "react";
import type { PublicRecord } from "@/lib/public-content";
import { RecordCard } from "@/components/public-ui";

export function BlogBrowser({ items }: { items: PublicRecord[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = [
    "All",
    ...new Set(items.flatMap((item) => item.categories.map((c) => c.name))),
  ];
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "All" ||
            item.categories.some((c) => c.name === category)) &&
          `${item.title} ${item.summary ?? ""}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [items, category, query],
  );
  return (
    <>
      <div className="blog-tools">
        <label className="blog-search">
          Search articles
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search insights…"
          />
        </label>
        <div className="blog-filters" aria-label="Filter by category">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      {visible.length ? (
        <div className="record-grid blog-grid">
          {visible.map((item, i) => (
            <RecordCard
              key={item.id}
              item={item}
              href={`/blog/${item.slug}`}
              index={i}
              kind="article"
            />
          ))}
        </div>
      ) : (
        <p className="blog-empty">
          {items.length
            ? "No articles match this search yet."
            : "New ideas and perspectives will appear here as articles are published."}
        </p>
      )}
    </>
  );
}
