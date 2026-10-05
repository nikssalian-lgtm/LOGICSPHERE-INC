"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { Button, Field, LoadingState, Notice } from "./ui";
import { useAuth } from "./auth-provider";
type Taxonomy = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  content_count: number;
};
function errorText(e: unknown) {
  return e instanceof ApiError
    ? Object.values(e.errors).flat().join(" ") || e.message
    : e instanceof Error
      ? e.message
      : "Unable to complete the request.";
}
export function TaxonomyManager() {
  const { user } = useAuth();
  const mayEdit = Boolean(
    user?.permissions.includes("*") ||
    user?.permissions.includes("blog.update"),
  );
  const [type, setType] = useState<"category" | "tag">("category");
  const [rows, setRows] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<{ data: Taxonomy[] }>(
        `/admin/blog/taxonomies/${type}`,
      );
      setRows(r.data);
      setError("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [type]);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing)
        await api(`/admin/blog/taxonomies/${editing}`, {
          method: "PATCH",
          body: JSON.stringify({ name, description }),
        });
      else
        await api(`/admin/blog/taxonomies/${type}`, {
          method: "POST",
          body: JSON.stringify({ name, description }),
        });
      setName("");
      setDescription("");
      setEditing(null);
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  }
  async function remove(row: Taxonomy) {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    try {
      await api(`/admin/blog/taxonomies/${row.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  }
  if (loading && !rows.length)
    return <LoadingState label="Loading blog categories and tags" />;
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">BLOG ORGANIZATION</p>
          <h1>Categories & tags</h1>
          <p>Manage the reusable classifications for articles.</p>
        </div>
        <div className="heading-actions">
          <button
            className={`button secondary ${type === "category" ? "selected" : ""}`}
            onClick={() => setType("category")}
          >
            Categories
          </button>
          <button
            className={`button secondary ${type === "tag" ? "selected" : ""}`}
            onClick={() => setType("tag")}
          >
            Tags
          </button>
        </div>
      </div>
      {error && <Notice error>{error}</Notice>}
      <div className="taxonomy-layout">
        {mayEdit && (
          <form className="settings-form" onSubmit={save}>
            <h2>{editing ? `Edit ${type}` : `New ${type}`}</h2>
            <Field
              label="Name"
              id="taxonomy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label className="field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </label>
            <div className="heading-actions">
              <Button type="submit">
                {editing ? (
                  "Save changes"
                ) : (
                  <>
                    <Plus size={16} />
                    Add {type}
                  </>
                )}
              </Button>
              {editing && (
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setName("");
                    setDescription("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
        <div className="cms-table-wrap">
          <table className="cms-table">
            <thead>
              <tr>
                <th>{type}</th>
                <th>Articles</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <small>/{row.slug}</small>
                  </td>
                  <td>{row.content_count}</td>
                  <td className="actions-cell">
                    {mayEdit && (
                      <>
                        <button
                          className="text-action"
                          onClick={() => {
                            setEditing(row.id);
                            setName(row.name);
                            setDescription(row.description ?? "");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="table-action danger"
                          aria-label={`Delete ${row.name}`}
                          onClick={() => void remove(row)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={3} className="cms-empty">
                    No {type}s added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
