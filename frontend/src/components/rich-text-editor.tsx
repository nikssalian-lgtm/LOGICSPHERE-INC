"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";

export function RichTextEditor({
  value,
  onChange,
  onChooseImage,
}: {
  value: Record<string, unknown> | null;
  onChange: (value: Record<string, unknown>) => void;
  onChooseImage: () => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        protocols: ["https", "http", "mailto"],
      }),
      Image.configure({ allowBase64: false }),
    ],
    content: value ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) =>
      onChange(instance.getJSON() as Record<string, unknown>),
  });
  useEffect(() => {
    if (
      editor &&
      value &&
      JSON.stringify(editor.getJSON()) !== JSON.stringify(value)
    )
      editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);
  if (!editor) return <div className="editor-loading">Preparing editor…</div>;
  const button = (
    label: string,
    icon: React.ReactNode,
    action: () => void,
    active = false,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={active ? "editor-tool is-active" : "editor-tool"}
      onClick={action}
    >
      {icon}
    </button>
  );
  return (
    <div className="rich-editor">
      <div className="editor-toolbar" aria-label="Text formatting">
        {button(
          "Bold",
          <Bold size={16} />,
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
        )}
        {button(
          "Italic",
          <Italic size={16} />,
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
        )}
        {button(
          "Heading",
          <Heading2 size={16} />,
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive("heading"),
        )}
        {button(
          "Bullet list",
          <List size={16} />,
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive("bulletList"),
        )}
        {button(
          "Numbered list",
          <ListOrdered size={16} />,
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive("orderedList"),
        )}
        {button(
          "Quote",
          <Quote size={16} />,
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive("blockquote"),
        )}
        {button("Add link", <Link2 size={16} />, () => {
          const href = window.prompt("Enter an https:// URL");
          if (href) editor.chain().focus().setLink({ href }).run();
        })}
        {button("Insert image", <ImagePlus size={16} />, onChooseImage)}
        {button("Undo", <Undo2 size={16} />, () =>
          editor.chain().focus().undo().run(),
        )}
        {button("Redo", <Redo2 size={16} />, () =>
          editor.chain().focus().redo().run(),
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
