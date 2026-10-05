import type { ReactNode } from "react";
import Image from "next/image";

type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Mark[];
  content?: Node[];
};

function inline(node: Node, key: string): ReactNode {
  if (node.type === "hardBreak") return <br key={key} />;
  if (node.type === "image") {
    const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
    if (!/^\/api\/v1\/public\/media\/[1-9]\d*\/file$/.test(src)) return null;
    return (
      <Image
        key={key}
        src={src}
        alt={alt}
        width={1200}
        height={800}
        sizes="100vw"
        loading="lazy"
      />
    );
  }
  let result: ReactNode =
    node.text ??
    node.content?.map((child, i) => inline(child, `${key}-${i}`)) ??
    null;
  for (const [index, mark] of (node.marks ?? []).entries()) {
    if (mark.type === "bold")
      result = <strong key={`${key}-b${index}`}>{result}</strong>;
    if (mark.type === "italic")
      result = <em key={`${key}-i${index}`}>{result}</em>;
    if (mark.type === "strike")
      result = <s key={`${key}-s${index}`}>{result}</s>;
    if (mark.type === "code")
      result = <code key={`${key}-c${index}`}>{result}</code>;
    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.includes("\\") &&
        !/[\u0000-\u0020]/.test(href)
      )
        result = (
          <a key={`${key}-l${index}`} href={href}>
            {result}
          </a>
        );
      else if (href.startsWith("https://"))
        result = (
          <a
            key={`${key}-l${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {result}
          </a>
        );
    }
  }
  return <span key={key}>{result}</span>;
}

function block(node: Node, key: string): ReactNode {
  const children = node.content?.map((child, i) => block(child, `${key}-${i}`));
  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return (
        <p key={key}>
          {node.content?.map((child, i) => inline(child, `${key}-${i}`))}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level);
      const content = node.content?.map((child, i) =>
        inline(child, `${key}-${i}`),
      );
      if (level === 2) return <h2 key={key}>{content}</h2>;
      if (level === 3) return <h3 key={key}>{content}</h3>;
      return <h4 key={key}>{content}</h4>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "image":
      return inline(node, key);
    default:
      return null;
  }
}

export function RichBody({ value }: { value: unknown }) {
  if (!value || typeof value !== "object") return null;
  return <div className="rich-body">{block(value as Node, "body")}</div>;
}
