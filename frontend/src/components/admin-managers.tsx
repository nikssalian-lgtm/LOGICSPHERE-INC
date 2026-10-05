"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  Plus,
  Save,
  Search,
  Shield,
  Upload,
  UserPlus,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { Button, Field, LoadingState, Notice } from "./ui";
import { useAuth } from "./auth-provider";

type Row = Record<string, unknown> & { id: number };
type List<T> = {
  data: T[];
  meta?: { total: number; current_page?: number; last_page?: number };
  roles?: { name: string; slug: string }[];
  assignees?: { id: number; name: string }[];
};
const message = (error: unknown) =>
  error instanceof ApiError
    ? Object.values(error.errors).flat().join(" ") || error.message
    : error instanceof Error
      ? error.message
      : "Unable to complete this action.";
const date = (value: unknown) =>
  value ? new Date(String(value)).toLocaleString() : "—";

export function MediaManager() {
  const { user } = useAuth();
  const can = (action: string) =>
    Boolean(
      user?.permissions.includes("*") ||
      user?.permissions.includes(`media.${action}`),
    );
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<List<Row>>(
        `/admin/media?page=${page}&per_page=30${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      );
      setItems(r.data);
      setError("");
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [page, search]);
  useEffect(() => {
    void load();
  }, [load]);
  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("alt_text", alt);
      await api("/admin/media", { method: "POST", body: form });
      setFile(null);
      setAlt("");
      setNotice("File uploaded to the private media library.");
      await load();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: Row) {
    if (!window.confirm("Archive this media file?")) return;
    try {
      await api(`/admin/media/${item.id}`, { method: "DELETE" });
      setNotice("Media file archived.");
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  if (loading && !items.length)
    return <LoadingState label="Loading media library" />;
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ASSET MANAGEMENT</p>
          <h1>Media library</h1>
          <p>
            Upload and reuse images or video. Files remain private until
            explicitly published.
          </p>
        </div>
      </div>
      {notice && <Notice>{notice}</Notice>}
      {error && <Notice error>{error}</Notice>}
      {can("create") && (
        <form className="upload-panel" onSubmit={upload}>
          <div>
            <Upload />
            <strong>Add media</strong>
            <span>Images and videos up to 100 MB</span>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            aria-label="Choose an image or video"
          />
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alternative text (for images)"
            aria-label="Alternative text"
          />
          <Button type="submit" loading={busy} disabled={!file}>
            Upload file
          </Button>
        </form>
      )}
      <label className="cms-search media-search">
        <Search size={17} />
        <input
          placeholder="Search files"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </label>
      <div className="media-grid">
        {items.map((item) => (
          <article className="media-card" key={item.id}>
            <div className="media-preview">
              {String(item.mime_type).startsWith("image/") ? (
                <img
                  src={String(item.preview_url)}
                  alt={String(item.alt_text || "")}
                  loading="lazy"
                />
              ) : (
                <video
                  src={String(item.preview_url)}
                  controls
                  preload="metadata"
                />
              )}
            </div>
            <div className="media-card-info">
              <strong title={String(item.name)}>{String(item.name)}</strong>
              <small>
                {Math.ceil(Number(item.size) / 1024)} KB ·{" "}
                {String(item.mime_type)}
              </small>
              {can("publish") && (
                <label className="media-public">
                  <input
                    type="checkbox"
                    checked={Boolean(item.is_public)}
                    onChange={async (e) => {
                      try {
                        const r = await api<{ data: Row }>(
                          `/admin/media/${item.id}`,
                          {
                            method: "PATCH",
                            body: JSON.stringify({
                              is_public: e.target.checked,
                            }),
                          },
                        );
                        setItems((old) =>
                          old.map((i) => (i.id === item.id ? r.data : i)),
                        );
                      } catch (err) {
                        setError(message(err));
                      }
                    }}
                  />
                  Public URL enabled
                </label>
              )}
              <div className="media-card-actions">
                {Boolean(item.public_url) && (
                  <a
                    href={String(item.public_url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={15} /> Open public file
                  </a>
                )}
                {can("delete") && (
                  <button
                    className="text-action danger"
                    onClick={() => void remove(item)}
                  >
                    Archive
                  </button>
                )}
                <span>
                  {String(item.width || "")}
                  {item.width ? ` × ${String(item.height)}` : ""}
                </span>
              </div>
            </div>
          </article>
        ))}
        {!items.length && (
          <div className="cms-empty media-empty">No files uploaded yet.</div>
        )}
      </div>
      <div className="cms-pagination">
        <span>{items.length} files shown</span>
        <div>
          <button
            className="table-action"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            className="table-action"
            disabled={items.length < 30}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export function EnquiryManager() {
  const { user } = useAuth();
  const can = (permission: string) =>
    Boolean(
      user?.permissions.includes("*") || user?.permissions.includes(permission),
    );
  const [rows, setRows] = useState<Row[]>([]);
  const [assignees, setAssignees] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [archived, setArchived] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<List<Row>>(
        `/admin/enquiries?per_page=50${filter ? `&status=${filter}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}${archived ? "&archived=1" : ""}`,
      );
      setRows(r.data);
      setAssignees(r.assignees ?? []);
      setError("");
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [filter, search, archived]);
  useEffect(() => {
    void load();
  }, [load]);
  async function update(id: number, data: Record<string, unknown>) {
    try {
      const r = await api<{ data: Row }>(`/admin/enquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setSelected(r.data);
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try {
      const r = await api<{
        data: { note: string; author: string; created_at: string };
      }>(`/admin/enquiries/${selected.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ note }),
      });
      setSelected({
        ...selected,
        notes: [
          ...(Array.isArray(selected.notes) ? (selected.notes as Row[]) : []),
          r.data,
        ],
      });
      setNote("");
    } catch (e) {
      setError(message(e));
    }
  }
  async function open(item: Row) {
    try {
      const r = await api<{ data: Row }>(`/admin/enquiries/${item.id}`);
      setSelected(r.data);
      setStatus(String(r.data.status));
    } catch (e) {
      setError(message(e));
    }
  }
  if (loading && !rows.length)
    return <LoadingState label="Loading enquiries" />;
  const exportUrl = "/api/v1/admin/enquiries/export";
  async function archive(row: Row) {
    try {
      await api(`/admin/enquiries/${row.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  async function restore(row: Row) {
    try {
      await api(`/admin/enquiries/${row.id}/restore`, { method: "POST" });
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SALES PIPELINE</p>
          <h1>Enquiries</h1>
          <p>
            Review incoming project requests, track status and add internal
            notes.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className={`button secondary ${archived ? "selected" : ""}`}
            onClick={() => setArchived(!archived)}
          >
            {archived ? "Show active" : "Archived"}
          </button>
          {can("enquiries.export") && (
            <a className="button secondary" href={exportUrl}>
              <Download size={16} />
              Export CSV
            </a>
          )}
        </div>
      </div>
      {error && <Notice error>{error}</Notice>}
      <div className="cms-toolbar">
        <label className="cms-search">
          <Search size={17} />
          <input
            placeholder="Search people, email, company or reference"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {["new", "contacted", "qualified", "proposal", "won", "lost"].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </select>
      </div>
      <div className="cms-table-wrap">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Project</th>
              <th>Status</th>
              <th>Received</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{String(row.name)}</strong>
                  <small>
                    {String(row.email)}
                    {row.company ? ` · ${String(row.company)}` : ""}
                  </small>
                </td>
                <td>{String(row.project_type || "General enquiry")}</td>
                <td>
                  <span className={`status-pill ${String(row.status)}`}>
                    {String(row.status)}
                  </span>
                </td>
                <td>{date(row.created_at)}</td>
                <td>
                  {archived ? (
                    can("enquiries.update") && (
                      <button
                        className="text-action"
                        onClick={() => void restore(row)}
                      >
                        Restore
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        className="button secondary small"
                        onClick={() => void open(row)}
                      >
                        Open
                      </button>
                      {can("enquiries.delete") && (
                        <button
                          className="text-action danger"
                          onClick={() => void archive(row)}
                        >
                          Archive
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="cms-empty" colSpan={5}>
                  No enquiries have been received.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section
            className="cms-modal enquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-title"
          >
            <header>
              <div>
                <p className="eyebrow">{String(selected.reference)}</p>
                <h2 id="enquiry-title">{String(selected.name)}</h2>
                <a href={`mailto:${String(selected.email)}`}>
                  {String(selected.email)}
                </a>
              </div>
              <button
                className="table-action"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </header>
            <div className="enquiry-facts">
              <span>{String(selected.phone || "No phone")}</span>
              <span>{String(selected.company || "No company")}</span>
              <span>
                {String(selected.project_type || "Project type not supplied")}
              </span>
              <span>{String(selected.budget || "Budget not supplied")}</span>
            </div>
            <p className="enquiry-message">{String(selected.message)}</p>
            <div className="cms-form-grid">
              <label className="field">
                <span>Status</span>
                <select
                  disabled={!can("enquiries.update")}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    void update(selected.id, { status: e.target.value });
                  }}
                >
                  {[
                    "new",
                    "contacted",
                    "qualified",
                    "proposal",
                    "won",
                    "lost",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Assigned to</span>
                <select
                  disabled={!can("enquiries.assign")}
                  value={String((selected.assignee as Row | null)?.id ?? "")}
                  onChange={(e) =>
                    void update(selected.id, {
                      assigned_to: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {assignees.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <h3>Internal notes</h3>
            <div className="note-list">
              {(Array.isArray(selected.notes)
                ? (selected.notes as Row[])
                : []
              ).map((n, i) => (
                <p key={Number(n.id) || i}>
                  <strong>{String(n.author || "Team")}</strong>
                  <span>{String(n.note)}</span>
                  <small>{date(n.created_at)}</small>
                </p>
              ))}
              {!(Array.isArray(selected.notes) && selected.notes.length) && (
                <small>No notes yet.</small>
              )}
            </div>
            {can("enquiries.update") && (
              <form className="note-form" onSubmit={addNote}>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  minLength={2}
                  maxLength={5000}
                  placeholder="Add a private note…"
                  required
                />
                <Button type="submit" disabled={!note.trim()}>
                  Add note
                </Button>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export function SettingsManager({ group }: { group: string }) {
  const { user } = useAuth();
  const mayEdit = Boolean(
    user?.permissions.includes("*") ||
    user?.permissions.includes(
      group === "seo" ? "seo.update" : "settings.update",
    ),
  );
  const [fields, setFields] = useState<
    Record<string, { label: string; type: string }>
  >({});
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [media, setMedia] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let live = true;
    api<{
      data: Record<string, { label: string; type: string }>;
      values: Record<string, unknown>;
    }>(`/admin/settings/${group}`)
      .then((r) => {
        if (live) {
          setFields(r.data);
          setValues(r.values);
        }
      })
      .catch((e) => live && setError(message(e)))
      .finally(() => live && setLoading(false));
    if (group === "site" || group === "seo")
      api<List<Row>>("/admin/media?kind=image&per_page=100")
        .then((r) => live && setMedia(r.data))
        .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [group]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ message: string; values: Record<string, unknown> }>(
        `/admin/settings/${group}`,
        { method: "PUT", body: JSON.stringify(values) },
      );
      setValues(r.values);
      setNotice(r.message);
      setError("");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <LoadingState label="Loading settings" />;
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONFIGURATION</p>
          <h1>
            {group === "seo"
              ? "SEO settings"
              : group === "social"
                ? "Social links"
                : group === "contact"
                  ? "Contact settings"
                  : "Site settings"}
          </h1>
          <p>
            These values are managed centrally and can be consumed by public
            pages.
          </p>
        </div>
      </div>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <form className="settings-form" onSubmit={submit}>
        {Object.entries(fields).map(([key, field]) => (
          <label className="field" key={key}>
            <span>{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                disabled={!mayEdit}
                rows={4}
                value={String(values[key] ?? "")}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [key]: e.target.value }))
                }
              />
            ) : field.type === "boolean" ? (
              <input
                disabled={!mayEdit}
                type="checkbox"
                checked={Boolean(values[key])}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [key]: e.target.checked }))
                }
              />
            ) : field.type === "media" ? (
              <select
                disabled={!mayEdit}
                value={String(values[key] ?? "")}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [key]: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              >
                <option value="">No media selected</option>
                {media.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {String(asset.name)}
                    {asset.is_public ? " · public" : " · private"}
                  </option>
                ))}
              </select>
            ) : (
              <input
                disabled={!mayEdit}
                type={
                  field.type === "url"
                    ? "url"
                    : field.type === "email"
                      ? "email"
                      : "text"
                }
                value={String(values[key] ?? "")}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [key]: e.target.value }))
                }
              />
            )}
          </label>
        ))}
        {mayEdit && (
          <Button type="submit" loading={busy}>
            <Save size={16} />
            Save settings
          </Button>
        )}
      </form>
    </section>
  );
}

export function UserManager() {
  const { user } = useAuth();
  const mayManage = Boolean(
    user?.permissions.includes("*") ||
    user?.permissions.includes("users.manage"),
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [roles, setRoles] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [search, setSearch] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<List<Row>>(
        `/admin/users?search=${encodeURIComponent(search)}`,
      );
      setRows(r.data);
      setRoles(r.roles ?? []);
      setError("");
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [search]);
  useEffect(() => {
    void load();
  }, [load]);
  async function invite(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await api<{ message: string }>("/admin/users", {
        method: "POST",
        body: JSON.stringify({ name, email, role }),
      });
      setNotice(r.message);
      setShow(false);
      setName("");
      setEmail("");
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  async function patch(row: Row, data: Record<string, unknown>) {
    try {
      await api(`/admin/users/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  if (loading && !rows.length)
    return <LoadingState label="Loading team accounts" />;
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACCESS CONTROL</p>
          <h1>Users</h1>
          <p>Invite workspace users and manage account access.</p>
        </div>
        {mayManage && (
          <Button onClick={() => setShow(true)}>
            <UserPlus size={16} />
            Invite user
          </Button>
        )}
      </div>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <label className="cms-search">
        <Search size={17} />
        <input
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="cms-table-wrap">
        <table className="cms-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{String(row.name)}</strong>
                  <small>{String(row.email)}</small>
                </td>
                <td>
                  {mayManage ? (
                    <select
                      value={String(row.role)}
                      onChange={(e) =>
                        void patch(row, { role: e.target.value })
                      }
                      aria-label={`Role for ${String(row.name)}`}
                    >
                      {roles.map((r) => (
                        <option key={r.slug} value={r.slug}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    String(row.role)
                  )}
                </td>
                <td>
                  <span
                    className={`status-pill ${row.active ? "published" : "draft"}`}
                  >
                    {row.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>
                  {mayManage && (
                    <button
                      className={`text-action ${row.active ? "danger" : ""}`}
                      onClick={() =>
                        void patch(row, { is_active: !row.active })
                      }
                    >
                      {row.active ? "Disable" : "Enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <div className="modal-backdrop">
          <section
            className="cms-modal compact-modal"
            role="dialog"
            aria-modal="true"
          >
            <header>
              <h2>Invite workspace user</h2>
            </header>
            <form onSubmit={invite}>
              <Field
                label="Name"
                id="invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Field
                label="Email"
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="field">
                <span>Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <footer>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
                <Button type="submit">Create account</Button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export function RoleManager() {
  const { user } = useAuth();
  const mayManage = Boolean(
    user?.permissions.includes("*") ||
    user?.permissions.includes("roles.manage"),
  );
  type Permission = { id: number; key: string; label: string; group: string };
  type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
    permissions: Permission[];
  };
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Role | null>(null);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const load = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([
        api<List<Role>>("/admin/roles"),
        api<{ data: Permission[] }>("/admin/permissions"),
      ]);
      setRoles(r.data);
      setPermissions(p.data);
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  function start(role?: Role) {
    setEditing(role ?? null);
    setShow(true);
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setSelected(role?.permissions.map((p) => p.id) ?? []);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing)
        await api(`/admin/roles/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({ name, description, permission_ids: selected }),
        });
      else
        await api("/admin/roles", {
          method: "POST",
          body: JSON.stringify({ name, description, permission_ids: selected }),
        });
      setShow(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  async function remove(role: Role) {
    if (!window.confirm(`Delete the role ${role.name}?`)) return;
    try {
      await api(`/admin/roles/${role.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(message(e));
    }
  }
  if (loading) return <LoadingState label="Loading roles and permissions" />;
  const grouped = permissions.reduce<Record<string, Permission[]>>((out, p) => {
    (out[p.group] ??= []).push(p);
    return out;
  }, {});
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACCESS CONTROL</p>
          <h1>Roles & permissions</h1>
          <p>Set the exact areas each workspace role can manage.</p>
        </div>
        {mayManage && (
          <Button onClick={() => start()}>
            <Plus size={16} />
            New role
          </Button>
        )}
      </div>
      {error && <Notice error>{error}</Notice>}
      <div className="role-grid">
        {roles.map((role) => (
          <article className="role-card" key={role.id}>
            <div>
              <Shield />
              <span className="status-pill">
                {role.is_system ? "System" : "Custom"}
              </span>
            </div>
            <h2>{role.name}</h2>
            <p>{role.description || "No description provided."}</p>
            <small>
              {role.users_count} users · {role.permissions.length} permissions
            </small>
            {mayManage && (
              <footer>
                <button className="text-action" onClick={() => start(role)}>
                  Edit access
                </button>
                {!role.is_system && (
                  <button
                    className="text-action danger"
                    onClick={() => void remove(role)}
                  >
                    Delete
                  </button>
                )}
              </footer>
            )}
          </article>
        ))}
      </div>
      {show && mayManage && (
        <div className="modal-backdrop">
          <section
            className="cms-modal role-modal"
            role="dialog"
            aria-modal="true"
          >
            <header>
              <div>
                <p className="eyebrow">PERMISSION DESIGN</p>
                <h2>{editing ? `Edit ${editing.name}` : "Create role"}</h2>
              </div>
              <button className="table-action" onClick={() => setShow(false)}>
                ×
              </button>
            </header>
            <form onSubmit={save}>
              <Field
                label="Role name"
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={Boolean(editing?.is_system)}
              />
              <label className="field">
                <span>Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </label>
              <div className="permission-groups">
                {Object.entries(grouped).map(([group, items]) => (
                  <fieldset key={group}>
                    <legend>{group}</legend>
                    {items.map((p) => (
                      <label key={p.id}>
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={(e) =>
                            setSelected((ids) =>
                              e.target.checked
                                ? [...ids, p.id]
                                : ids.filter((id) => id !== p.id),
                            )
                          }
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
              <footer>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
                <Button type="submit">Save role</Button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export function ActivityManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<List<Row>>("/admin/activity?per_page=80")
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState label="Loading activity" />;
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AUDIT TRAIL</p>
          <h1>Activity</h1>
          <p>Recent administrative changes in this workspace.</p>
        </div>
      </div>
      <div className="cms-table-wrap">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Record</th>
              <th>By</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{String(row.action).replaceAll("_", " ")}</td>
                <td>
                  {String(row.entity_type || "—")}{" "}
                  {row.entity_id ? `#${String(row.entity_id)}` : ""}
                </td>
                <td>{String(row.user || "System")}</td>
                <td>{date(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="cms-empty">No admin actions recorded yet.</div>
        )}
      </div>
    </section>
  );
}
