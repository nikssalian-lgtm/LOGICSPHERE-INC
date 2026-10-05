"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "./auth-provider";
import { Button, Field, LoadingState, Notice } from "./ui";
const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((m) => m.RichTextEditor),
  { ssr: false },
);
type FieldSpec = {
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
};
type CmsModule = {
  key: string;
  label: string;
  item: string;
  fields: Record<string, FieldSpec>;
  has_summary: boolean;
  has_body: boolean;
};
type Media = {
  id: number;
  name: string;
  preview_url: string;
  public_url: string | null;
  mime_type: string;
  is_public: boolean;
  alt_text: string;
};
type Taxonomy = { id: number; name: string; slug: string };
type Item = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  body: Record<string, unknown> | null;
  status: string;
  featured: boolean;
  sort_order: number;
  updated_at: string;
  attributes: Record<string, unknown>;
  media: Media[];
  taxonomies?: Taxonomy[];
  categories?: Taxonomy[];
};
type PageResponse = {
  data: Item[];
  meta: { current_page: number; last_page: number; total: number };
  module: CmsModule;
};
const blankBody = { type: "doc", content: [{ type: "paragraph" }] };
const humanize = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function ContentManager({ module }: { module: string }) {
  const { user } = useAuth();
  const can = (action: string) =>
    Boolean(
      user?.permissions.includes("*") ||
      user?.permissions.includes(`${module}.${action}`),
    );
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [archived, setArchived] = useState(false);
  const [menuGroup, setMenuGroup] = useState("primary");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | null | false>(false);
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: String(page),
        per_page: module === "menus" ? "50" : "20",
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(archived ? { archived: "1" } : {}),
      });
      setData(await api<PageResponse>(`/admin/content/${module}?${query}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load content.");
    } finally {
      setLoading(false);
    }
  }, [module, page, search, status, archived]);
  useEffect(() => {
    void load();
  }, [load]);
  async function act(item: Item, action: string) {
    if (action === "archive" && !window.confirm(`Archive ${item.title}?`))
      return;
    setBusy(true);
    setError("");
    try {
      if (action === "archive")
        await api(`/admin/content/${module}/${item.id}`, { method: "DELETE" });
      else if (action === "restore")
        await api(`/admin/content/${module}/${item.id}/restore`, {
          method: "POST",
        });
      else
        await api(`/admin/content/${module}/${item.id}/publication`, {
          method: "POST",
          body: JSON.stringify({ publish: action === "publish" }),
        });
      setNotice(
        `${data?.module.item ?? "Item"} ${action === "archive" ? "archived" : action === "restore" ? "restored" : action === "publish" ? (module === "menus" ? "shown on the website" : "published") : module === "menus" ? "hidden from the website" : "moved to draft"}.`,
      );
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "That action could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading && !data) return <LoadingState label={`Loading ${module}`} />;
  if (error && !data)
    return (
      <section className="workspace-page">
        <Notice error>{error}</Notice>
        <Button onClick={() => void load()}>Retry</Button>
      </section>
    );
  const config = data?.module;
  const visibleItems =
    data?.data.filter(
      (item) => module !== "menus" || item.attributes.menu === menuGroup,
    ) ?? [];
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONTENT MANAGEMENT</p>
          <h1>
            {module === "menus"
              ? "Header menu & sections"
              : (config?.label ?? humanize(module))}
          </h1>
          <p>
            {module === "menus"
              ? "Hide or publish an entire header section. Hiding Work removes its header link, homepage work sections and public portfolio pages. Publishing restores them without changing their content. Footer links can be managed separately below."
              : `Manage and publish ${config?.label.toLowerCase()} for your website.`}
          </p>
        </div>
        <div className="heading-actions">
          <button
            className={`button secondary ${archived ? "selected" : ""}`}
            onClick={() => {
              setArchived(!archived);
              setPage(1);
            }}
          >
            <Archive size={16} />
            {archived ? "View active" : "Archived"}
          </button>
          {!archived && can("create") && (
            <Button onClick={() => setEditing(null)}>
              <Plus size={17} />
              New {config?.item}
            </Button>
          )}
        </div>
      </div>
      {notice && (
        <div className="cms-notice">
          <span>
            <Check size={16} /> {notice}
          </span>
          <button aria-label="Dismiss" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && <Notice error>{error}</Notice>}
      <div className="cms-toolbar">
        {module === "menus" && (
          <select
            aria-label="Menu location"
            value={menuGroup}
            onChange={(event) => {
              setMenuGroup(event.target.value);
              setPage(1);
            }}
          >
            <option value="primary">Header sections</option>
            <option value="footer-services">Footer — Services</option>
            <option value="footer-company">Footer — Company</option>
            <option value="footer-resources">Footer — Resources</option>
          </select>
        )}
        <label className="cms-search">
          <Search size={17} />
          <input
            aria-label="Search content"
            placeholder={`Search ${config?.label.toLowerCase()}…`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">
            {module === "menus" ? "Hidden" : "Draft"}
          </option>
          <option value="published">Published</option>
        </select>
        <span className="cms-total">{data?.meta.total ?? 0} records</span>
      </div>
      <div className="cms-table-wrap">
        <table className="cms-table">
          <thead>
            <tr>
              <th>{config?.item}</th>
              <th>{module === "menus" ? "Visibility" : "Status"}</th>
              <th>Updated</th>
              <th className="actions-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data
              .filter(
                (item) =>
                  module !== "menus" || item.attributes.menu === menuGroup,
              )
              .map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <small>
                      {module === "menus"
                        ? `${String(item.attributes.menu || "primary")} · ${String(item.attributes.url || "/")}`
                        : `/${item.slug}`}
                    </small>
                  </td>
                  <td>
                    <span className={`status-pill ${item.status}`}>
                      {module === "menus"
                        ? item.status === "published"
                          ? "Published"
                          : "Hidden"
                        : item.status}
                    </span>
                  </td>
                  <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {!archived && can("update") && (
                      <button
                        title="Edit"
                        aria-label={`Edit ${item.title}`}
                        className="table-action"
                        onClick={() => setEditing(item)}
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    {archived ? (
                      can("update") && (
                        <button
                          title="Restore"
                          aria-label={`Restore ${item.title}`}
                          className="table-action"
                          disabled={busy}
                          onClick={() => void act(item, "restore")}
                        >
                          <RotateCcw size={16} />
                        </button>
                      )
                    ) : (
                      <>
                        {can("publish") && (
                          <button
                            title={
                              item.status === "published"
                                ? module === "menus"
                                  ? "Hide from website"
                                  : "Unpublish"
                                : module === "menus"
                                  ? "Publish on website"
                                  : "Publish"
                            }
                            aria-label={
                              item.status === "published"
                                ? `${module === "menus" ? "Hide" : "Unpublish"} ${item.title}`
                                : `Publish ${item.title}`
                            }
                            disabled={busy}
                            className="table-action"
                            onClick={() =>
                              void act(
                                item,
                                item.status === "published"
                                  ? "draft"
                                  : "publish",
                              )
                            }
                          >
                            {module === "menus" ? (
                              <>
                                {item.status === "published" ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}{" "}
                                {item.status === "published"
                                  ? "Hide"
                                  : "Publish"}
                              </>
                            ) : (
                              <ExternalLink size={16} />
                            )}
                          </button>
                        )}
                        {can("delete") && (
                          <button
                            title="Archive"
                            aria-label={`Archive ${item.title}`}
                            disabled={busy}
                            className="table-action danger"
                            onClick={() => void act(item, "archive")}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            {!visibleItems.length && (
              <tr>
                <td colSpan={4} className="cms-empty">
                  <span>
                    {archived ? "No archived records" : "No content yet"}
                  </span>
                  <small>
                    Create your first {config?.item.toLowerCase()} to start
                    building the CMS.
                  </small>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="cms-pagination">
        <span>
          Page {data?.meta.current_page ?? page} of {data?.meta.last_page ?? 1}
        </span>
        <div>
          <button
            className="table-action"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="table-action"
            disabled={page >= (data?.meta.last_page ?? 1)}
            onClick={() => setPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {editing !== false && can(editing ? "update" : "create") && (
        <ContentForm
          module={module}
          config={config!}
          item={editing}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            setEditing(false);
            setNotice(`${config?.item ?? "Content"} saved as draft.`);
            await load();
          }}
          onError={setError}
        />
      )}
    </section>
  );
}

function ContentForm({
  module,
  config,
  item,
  onClose,
  onSaved,
  onError,
}: {
  module: string;
  config: CmsModule;
  item: Item | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [summary, setSummary] = useState(item?.summary ?? "");
  const [body, setBody] = useState(item?.body ?? blankBody);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [attributes, setAttributes] = useState<Record<string, unknown>>(
    item?.attributes ?? {},
  );
  const [media, setMedia] = useState<Media[]>([]);
  const [mediaIds, setMediaIds] = useState<number[]>(
    item?.media?.map((asset) => asset.id) ?? [],
  );
  const [categories, setCategories] = useState<Taxonomy[]>([]);
  const [tags, setTags] = useState<Taxonomy[]>([]);
  const [categoryId, setCategoryId] = useState(item?.categories?.[0]?.id ?? "");
  const [tagIds, setTagIds] = useState<number[]>(
    item?.taxonomies?.map((tag) => tag.id) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  useEffect(() => {
    const images = api<{ data: Media[] }>(
      "/admin/media?per_page=100&kind=image",
    );
    const videos =
      module === "portfolio"
        ? api<{ data: Media[] }>("/admin/media?per_page=100&kind=video")
        : Promise.resolve({ data: [] as Media[] });
    Promise.all([images, videos])
      .then(([imageResult, videoResult]) =>
        setMedia([...imageResult.data, ...videoResult.data]),
      )
      .catch(() => setMedia([]));
  }, [module]);
  useEffect(() => {
    if (module === "blog") {
      api<{ data: Taxonomy[] }>("/admin/blog/taxonomies/category")
        .then((r) => setCategories(r.data))
        .catch(() => setCategories([]));
      api<{ data: Taxonomy[] }>("/admin/blog/taxonomies/tag")
        .then((r) => setTags(r.data))
        .catch(() => setTags([]));
    }
  }, [module]);
  function setAttr(key: string, value: unknown) {
    setAttributes((old) => ({ ...old, [key]: value }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const result = await api<{ data: Item }>(
        `/admin/content/${module}${item ? `/${item.id}` : ""}`,
        {
          method: item ? "PUT" : "POST",
          body: JSON.stringify({
            title,
            slug: slug || undefined,
            summary,
            body: config.has_body ? body : null,
            featured,
            sort_order: Number(sortOrder),
            attributes,
            media_ids: mediaIds,
          }),
        },
      );
      if (module === "blog") {
        await api(`/admin/blog/${result.data.id}/category`, {
          method: "POST",
          body: JSON.stringify({
            category_id: categoryId ? Number(categoryId) : null,
          }),
        });
        await api(`/admin/blog/${result.data.id}/tags`, {
          method: "POST",
          body: JSON.stringify({ tag_ids: tagIds }),
        });
      }
      onSaved();
    } catch (e) {
      const message =
        e instanceof ApiError
          ? Object.values(e.errors).flat().join(" ") || e.message
          : e instanceof Error
            ? e.message
            : "Unable to save.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="cms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-form-title"
      >
        <header>
          <div>
            <p className="eyebrow">{item ? "EDIT RECORD" : "NEW RECORD"}</p>
            <h2 id="content-form-title">
              {item ? `Edit ${config.item}` : `Create ${config.item}`}
            </h2>
          </div>
          <button className="table-action" aria-label="Close" onClick={onClose}>
            <X />
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="cms-form-grid">
            <Field
              label="Title"
              id="cms-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Field
              label="URL slug"
              id="cms-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="generated-from-title"
            />
            {config.has_summary && (
              <label className="field full">
                <span>Short description</span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </label>
            )}
            {Object.entries(config.fields).map(([key, spec]) => (
              <FieldControl
                key={key}
                name={key}
                spec={spec}
                value={attributes[key]}
                media={media}
                onChange={(value) => setAttr(key, value)}
              />
            ))}
            {module === "blog" && (
              <>
                <label className="field">
                  <span>Category</span>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset className="media-association">
                  <legend>Tags</legend>
                  <div className="tag-options">
                    {tags.map((tag) => (
                      <label key={tag.id}>
                        <input
                          type="checkbox"
                          checked={tagIds.includes(tag.id)}
                          onChange={(e) =>
                            setTagIds((ids) =>
                              e.target.checked
                                ? [...ids, tag.id]
                                : ids.filter((id) => id !== tag.id),
                            )
                          }
                        />
                        {tag.name}
                      </label>
                    ))}
                    {!tags.length && (
                      <small>Create tags from Blog categories & tags.</small>
                    )}
                  </div>
                </fieldset>
              </>
            )}
            <fieldset className="media-association full">
              <legend>
                {module === "portfolio"
                  ? "Linked images & videos"
                  : "Linked images"}
              </legend>
              <div className="media-select-grid">
                {media.map((asset) => (
                  <label key={asset.id}>
                    <input
                      type="checkbox"
                      checked={mediaIds.includes(asset.id)}
                      onChange={(e) =>
                        setMediaIds((ids) =>
                          e.target.checked
                            ? [...ids, asset.id]
                            : ids.filter((id) => id !== asset.id),
                        )
                      }
                    />
                    {asset.mime_type.startsWith("video/") ? (
                      <video
                        src={asset.preview_url}
                        muted
                        playsInline
                        preload="none"
                        aria-label={asset.name}
                      />
                    ) : (
                      <img src={asset.preview_url} alt="" loading="lazy" />
                    )}
                    <span>{asset.name}</span>
                    {!asset.is_public && <small>Private</small>}
                  </label>
                ))}
                {!media.length && (
                  <small>
                    {module === "portfolio"
                      ? "Upload images or videos in the Media library first."
                      : "Upload images in the Media library first."}
                  </small>
                )}
              </div>
            </fieldset>
            {config.has_body && (
              <label className="field full">
                <span>Detailed content</span>
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  onChooseImage={() => {
                    const available = media.filter(
                      (entry) =>
                        entry.is_public && entry.mime_type.startsWith("image/"),
                    );
                    if (!available.length) {
                      setFormError(
                        "Upload an image and enable its public URL in the Media library first.",
                      );
                      return;
                    }
                    const choice = window.prompt(
                      `Choose a public image ID:\n${available.map((entry) => `${entry.id}: ${entry.name}`).join("\n")}`,
                      String(available[0].id),
                    );
                    const asset = available.find(
                      (entry) => entry.id === Number(choice),
                    );
                    if (asset?.public_url)
                      setBody((v) => ({
                        ...v,
                        content: [
                          ...(Array.isArray(v.content) ? v.content : []),
                          {
                            type: "image",
                            attrs: {
                              src: asset.public_url,
                              alt: asset.alt_text,
                            },
                          },
                        ],
                      }));
                  }}
                />
              </label>
            )}
            <Field
              label="Display order"
              id="cms-sort"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
            <label className="check-field">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />{" "}
              Feature this item
            </label>
          </div>
          {formError && <Notice error>{formError}</Notice>}
          <footer>
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <Button type="submit" loading={saving}>
              Save draft
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}
function FieldControl({
  name,
  spec,
  value,
  media,
  onChange,
}: {
  name: string;
  spec: FieldSpec;
  value: unknown;
  media: Media[];
  onChange: (v: unknown) => void;
}) {
  const id = `field-${name}`;
  const label = spec.label;
  const type = spec.type;
  if (type === "boolean")
    return (
      <label className="check-field">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    );
  if (type === "select")
    return (
      <label className="field">
        <span>{label}</span>
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Choose…</option>
          {spec.options?.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  if (type === "textarea")
    return (
      <label className="field">
        <span>{label}</span>
        <textarea
          id={id}
          rows={4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  if (type === "richtext")
    return (
      <div className="field">
        <span>{label}</span>
        <RichTextEditor
          value={
            typeof value === "object" && value
              ? (value as Record<string, unknown>)
              : null
          }
          onChange={onChange}
          onChooseImage={() => {
            const available = media.filter(
              (asset) =>
                asset.is_public && asset.mime_type.startsWith("image/"),
            );
            if (!available.length) return;
            const choice = window.prompt(
              `Choose a public image ID:\n${available.map((asset) => `${asset.id}: ${asset.name}`).join("\n")}`,
              String(available[0].id),
            );
            const asset = available.find(
              (entry) => entry.id === Number(choice),
            );
            if (asset?.public_url)
              onChange({
                type: "doc",
                content: [
                  {
                    type: "image",
                    attrs: { src: asset.public_url, alt: asset.alt_text },
                  },
                ],
              });
          }}
        />
      </div>
    );
  if (type === "tags")
    return (
      <label className="field">
        <span>{label}</span>
        <input
          id={id}
          value={Array.isArray(value) ? value.join(", ") : ""}
          placeholder="Separate items with commas"
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
      </label>
    );
  if (type === "media")
    return (
      <label className="field">
        <span>{label}</span>
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">No media selected</option>
          {media.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
              {asset.is_public ? " · public" : " · private"}
            </option>
          ))}
        </select>
      </label>
    );
  return (
    <label className="field">
      <span>{label}</span>
      <input
        id={id}
        type={type === "number" ? "number" : type === "url" ? "url" : "text"}
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(
            type === "number"
              ? e.target.value
                ? Number(e.target.value)
                : null
              : e.target.value,
          )
        }
      />
    </label>
  );
}
