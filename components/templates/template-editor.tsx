"use client";

import { useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
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

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-brand-navy-200 bg-brand-navy-50 p-2">
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Negrito
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Itálico
        </Button>
        <Button type="button" variant="outline" className="h-8" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Lista
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
        <EditorContent editor={editor} className="min-h-[280px] [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:outline-none" />
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
