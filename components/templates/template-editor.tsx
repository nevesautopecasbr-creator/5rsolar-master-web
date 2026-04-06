"use client";

import { useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export type TemplateVariable = {
  label: string;
  placeholder: string;
  description: string;
  example: string;
  category: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  variables: TemplateVariable[];
};

type AutocompleteState = {
  open: boolean;
  query: string;
  from: number;
};

export function TemplateEditor({ value, onChange, variables }: Props) {
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    open: false,
    query: "",
    from: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const filteredVariables = useMemo(() => {
    const query = autocomplete.query.trim().toLowerCase();
    if (!query) return variables.slice(0, 8);
    return variables
      .filter((item) => {
        return (
          item.placeholder.toLowerCase().includes(query) ||
          item.label.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [autocomplete.query, variables]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: true }),
      Image.configure({ inline: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      onChange(html);

      const from = currentEditor.state.selection.from;
      const textUntilCursor = currentEditor.state.doc.textBetween(0, from, "\n", "\0");
      const match = textUntilCursor.match(/\{\{([\w]*)$/);
      if (!match) {
        setAutocomplete((prev) => ({ ...prev, open: false }));
        return;
      }
      const query = match[1] ?? "";
      const triggerLength = match[0]?.length ?? 0;
      setAutocomplete({
        open: true,
        query,
        from: from - triggerLength,
      });
    },
  });

  function insertPlaceholder(placeholder: string) {
    if (!editor) return;
    const currentFrom = editor.state.selection.from;
    if (autocomplete.open) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: autocomplete.from, to: currentFrom })
        .insertContent(placeholder)
        .run();
    } else {
      editor.chain().focus().insertContent(placeholder).run();
    }
    setAutocomplete((prev) => ({ ...prev, open: false }));
  }

  async function handleImageUpload(file: File) {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setUploadingImage(true);
    try {
      const response = await apiFetch("/api/document-templates/assets/image", {
        method: "POST",
        body: JSON.stringify({ fileBase64: dataUrl, fileName: file.name }),
      });
      if (!response.ok) return;
      const payload = await response.json();
      const url = payload?.fileUrl;
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } finally {
      setUploadingImage(false);
    }
  }

  function toggleLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Informe a URL do link", previousUrl ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  function isActive(name: "bold" | "italic" | "underline" | "bulletList" | "orderedList" | "blockquote" | "codeBlock" | "heading" | "paragraph", attrs?: Record<string, unknown>) {
    if (!editor) return false;
    return editor.isActive(name, attrs);
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-brand-navy-200 bg-brand-navy-50 p-2">
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("paragraph") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().setParagraph().run()}
        >
          Parágrafo
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("heading", { level: 1 }) ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          Título 1
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("heading", { level: 2 }) ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Título 2
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("bold") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Negrito
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("italic") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Itálico
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("underline") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          Sublinhado
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={toggleLink}>
          Link
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("bulletList") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          Lista
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("orderedList") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          Lista num.
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("blockquote") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          Citação
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-8 ${isActive("codeBlock") ? "border-brand-orange text-brand-orange" : ""}`}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          Bloco código
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
          Esq
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
          Centro
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
          Dir
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().setTextAlign("justify").run()}>
          Justificar
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          Linha
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().undo().run()}>
          Desfazer
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().redo().run()}>
          Refazer
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => insertPlaceholder("{{customerName}}")}>
          Inserir variável
        </Button>
        <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border-2 border-brand-navy-300 bg-white px-3 text-xs font-semibold text-brand-navy-800 hover:bg-brand-navy-50">
          {uploadingImage ? "Enviando imagem..." : "Adicionar imagem"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImageUpload(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <div className="relative rounded-md border border-brand-navy-300 bg-white p-3">
        <EditorContent
          editor={editor}
          className={[
            "min-h-[320px]",
            "[&_.ProseMirror]:min-h-[300px]",
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror]:leading-7",
            "[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3",
            "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-2",
            "[&_.ProseMirror_p]:mb-3",
            "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:mb-3",
            "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:mb-3",
            "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-brand-navy-300 [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:italic",
          ].join(" ")}
        />
        {autocomplete.open && filteredVariables.length > 0 ? (
          <div className="absolute left-3 top-3 z-10 w-[320px] rounded-md border border-brand-navy-200 bg-white shadow-lg">
            {filteredVariables.map((item) => (
              <button
                key={item.placeholder}
                type="button"
                className="block w-full border-b border-brand-navy-100 px-3 py-2 text-left text-sm hover:bg-brand-navy-50"
                onClick={() => insertPlaceholder(item.placeholder)}
              >
                <div className="font-semibold text-brand-navy-800">{item.placeholder}</div>
                <div className="text-xs text-brand-navy-500">{item.description}</div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
