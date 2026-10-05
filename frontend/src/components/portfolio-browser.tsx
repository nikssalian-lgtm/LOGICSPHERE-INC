"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { Search, X } from "lucide-react";
import { RecordCard } from "@/components/public-ui";
import type { PublicRecord } from "@/lib/public-content";

const tags = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];

export function PortfolioBrowser({ projects }: { projects: PublicRecord[] }) {
  const [category, setCategory] = useState("all");
  const [technology, setTechnology] = useState("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const transitionFilter = (update: () => void) => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof document.startViewTransition !== "function"
    ) {
      update();
      return;
    }
    document.startViewTransition(() => flushSync(update));
  };

  const categories = useMemo(() => {
    const values = new Map<string, string>();
    projects.forEach((project) => {
      for (const value of [
        project.attributes.project_type,
        project.attributes.industry,
      ]) {
        if (typeof value === "string" && value.trim()) {
          values.set(value.toLocaleLowerCase(), value.trim());
        }
      }
    });
    return [...values.entries()].map(([key, label]) => ({ key, label }));
  }, [projects]);

  const technologies = useMemo(
    () =>
      [
        ...new Set(
          projects.flatMap((project) => tags(project.attributes.technologies)),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const visibleProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const projectCategory = [
        project.attributes.project_type,
        project.attributes.industry,
      ]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLocaleLowerCase() === category);
      const matchesCategory = category === "all" || projectCategory;
      const matchesTechnology =
        technology === "all" ||
        tags(project.attributes.technologies).some(
          (value) => value.toLocaleLowerCase() === technology,
        );
      const searchable = [
        project.title,
        project.summary,
        project.attributes.client,
        project.attributes.industry,
        project.attributes.project_type,
        ...tags(project.attributes.services),
        ...tags(project.attributes.technologies),
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLocaleLowerCase();
      return (
        matchesCategory &&
        matchesTechnology &&
        (!deferredQuery || searchable.includes(deferredQuery))
      );
    });
    return filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [projects, category, technology, deferredQuery]);

  const reset = () => {
    transitionFilter(() => {
      setCategory("all");
      setTechnology("all");
      setQuery("");
    });
  };

  return (
    <div className="portfolio-browser">
      <div className="portfolio-tools">
        <label className="portfolio-search">
          <Search size={17} aria-hidden="true" />
          <input
            aria-label="Search projects"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, clients, services…"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear project search"
            >
              <X size={15} />
            </button>
          )}
        </label>
        {technologies.length > 0 && (
          <label className="portfolio-technology-filter">
            <span>Technology</span>
            <select
              value={technology}
              onChange={(event) =>
                transitionFilter(() => setTechnology(event.target.value))
              }
              aria-label="Filter projects by technology"
            >
              <option value="all">All technologies</option>
              {technologies.map((item) => (
                <option key={item} value={item.toLocaleLowerCase()}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {categories.length > 0 && (
        <div
          className="portfolio-filters"
          aria-label="Filter projects by category"
        >
          <button
            type="button"
            className={category === "all" ? "is-active" : ""}
            aria-pressed={category === "all"}
            onClick={() => transitionFilter(() => setCategory("all"))}
          >
            All work <span>{String(projects.length).padStart(2, "0")}</span>
          </button>
          {categories.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              className={category === key ? "is-active" : ""}
              aria-pressed={category === key}
              onClick={() => transitionFilter(() => setCategory(key))}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="portfolio-results-line">
        <span aria-live="polite">
          {visibleProjects.length}{" "}
          {visibleProjects.length === 1 ? "project" : "projects"}
        </span>
        {(category !== "all" || technology !== "all" || query) && (
          <button type="button" onClick={reset}>
            Clear filters <X size={13} />
          </button>
        )}
      </div>
      {visibleProjects.length > 0 ? (
        <div className="record-grid project-grid portfolio-projects">
          {visibleProjects.map((project, index) => (
            <RecordCard
              key={project.id}
              item={project}
              href={`/portfolio/${project.slug}`}
              index={index}
              kind="project"
            />
          ))}
        </div>
      ) : (
        <div className="portfolio-no-results">
          <span>NO MATCHING WORK</span>
          <p>Try another category or search term.</p>
          <button className="button secondary" type="button" onClick={reset}>
            Show all work
          </button>
        </div>
      )}
    </div>
  );
}
