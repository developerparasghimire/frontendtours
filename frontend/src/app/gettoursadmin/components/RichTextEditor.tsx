"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  token?: string | null;
  placeholder?: string;
  minHeight?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
};

function ToolbarButton({
  onClick,
  active,
  title,
  children,
  disabled,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors select-none ${
        active
          ? "bg-brand-navy text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;
}

export default function RichTextEditor({
  value,
  onChange,
  token,
  placeholder = "Write your content here...",
  minHeight = "180px",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploading = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "outline-none w-full text-gray-800 text-sm leading-relaxed [&>*]:mb-2 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-brand-navy [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-brand-navy [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-brand-navy [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>blockquote]:border-l-4 [&>blockquote]:border-brand-navy/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>img]:max-w-full [&>img]:rounded-lg [&>img]:my-2 [&>p.is-editor-empty:first-child]:text-gray-400",
      },
    },
  });

  // Sync external value when modal opens (value changes from null → loaded)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file || uploading.current) return;
      if (!token) {
        alert("You must be logged in to upload images.");
        return;
      }

      uploading.current = true;
      const fd = new FormData();
      fd.append("image", file);

      try {
        const res = await fetch(`${API_URL}/common/upload-image/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Image upload failed.");
          return;
        }
        editor?.chain().focus().setImage({ src: data.url }).run();
      } catch {
        alert("Image upload failed. Check your connection.");
      } finally {
        uploading.current = false;
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [editor, token]
  );

  if (!editor) return null;

  const isActive = (nameOrAttrs: string | Record<string, unknown>, attrs?: Record<string, unknown>) =>
    typeof nameOrAttrs === "string" ? editor.isActive(nameOrAttrs, attrs) : editor.isActive(nameOrAttrs);

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-navy focus-within:border-transparent">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {/* Text formatting */}
        <ToolbarButton
          title="Bold (Ctrl+B)"
          active={isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italic (Ctrl+I)"
          active={isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Underline (Ctrl+U)"
          active={isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          title="Heading 1"
          active={isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          title="Bullet List"
          active={isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Numbered List"
          active={isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          title="Blockquote"
          active={isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarButton>

        <Divider />

        {/* Text align */}
        <ToolbarButton
          title="Align Left"
          active={isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          title="Align Center"
          active={isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ≡
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          title="Insert / Edit Link"
          active={isActive("link")}
          onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Enter URL (leave blank to remove link):", prev ?? "https://");
            if (url === null) return; // cancelled
            if (url.trim() === "") {
              editor.chain().focus().unsetLink().run();
            } else {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim(), target: "_blank", rel: "noopener noreferrer" }).run();
            }
          }}
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Link
          </span>
        </ToolbarButton>
        {isActive("link") && (
          <ToolbarButton
            title="Remove Link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
            </svg>
          </ToolbarButton>
        )}

        <Divider />

        {/* Image upload */}
        <ToolbarButton
          title="Insert Image"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Image
          </span>
        </ToolbarButton>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          title="Redo (Ctrl+Y)"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↪
        </ToolbarButton>
      </div>

      {/* Editor content area */}
      <div
        className="px-3 py-2 cursor-text"
        style={{ minHeight }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
