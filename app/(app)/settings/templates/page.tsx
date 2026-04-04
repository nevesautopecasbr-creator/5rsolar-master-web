"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { apiFetch } from "@/lib/api";
import { TemplateEditor, type TemplateVariable } from "@/components/templates/template-editor";

type TemplateType = "CONTRACT" | "PROPOSAL";

type DocumentTemplate = {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  updatedAt: string;
};

type FormState = {
  id?: string;
  name: string;
  type: TemplateType;
  content: string;
  isActive: boolean;
  isDefault: boolean;
};

const emptyForm: FormState = {
  name: "",
  type: "CONTRACT",
  content: "<h1>Novo template</h1><p>Digite aqui...</p>",
  isActive: true,
  isDefault: false,
};

export default function TemplatesSettingsPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<TemplateType>("CONTRACT");
  const [selectedActiveFilter, setSelectedActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [showVariablesPanel, setShowVariablesPanel] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return templates.filter((item) => {
      const activeOk =
        selectedActiveFilter === "all" ||
        (selectedActiveFilter === "active" && item.isActive) ||
        (selectedActiveFilter === "inactive" && !item.isActive);
      return item.type === selectedType && activeOk;
    });
  }, [templates, selectedActiveFilter, selectedType]);

  async function loadTemplates() {
    const response = await apiFetch("/api/document-templates");
    if (!response.ok) throw new Error("Falha ao carregar templates");
    const payload = await response.json();
    setTemplates(Array.isArray(payload) ? payload : []);
  }

  async function loadVariables(type: TemplateType) {
    const response = await apiFetch(`/api/document-templates/variables?type=${type}`);
    if (!response.ok) throw new Error("Falha ao carregar variáveis");
    const payload = await response.json();
    setVariables(Array.isArray(payload) ? payload : []);
  }

  useEffect(() => {
    void Promise.all([loadTemplates(), loadVariables(selectedType)]).catch(() => {
      setStatus("Falha ao carregar dados.");
    });
  }, []);

  useEffect(() => {
    void loadVariables(selectedType).catch(() => {
      setStatus("Falha ao carregar variáveis.");
    });
  }, [selectedType]);

  function startCreate() {
    setForm({ ...emptyForm, type: selectedType });
    setOpenModal(true);
  }

  function startEdit(item: DocumentTemplate) {
    setForm({
      id: item.id,
      name: item.name,
      type: item.type,
      content: item.content,
      isActive: item.isActive,
      isDefault: item.isDefault,
    });
    setOpenModal(true);
  }

  async function saveTemplate() {
    setLoading(true);
    setStatus(null);
    try {
      const endpoint = form.id ? `/api/document-templates/${form.id}` : "/api/document-templates";
      const method = form.id ? "PATCH" : "POST";
      const body = {
        name: form.name,
        type: form.type,
        content: form.content,
        isActive: form.isActive,
        isDefault: form.isDefault,
      };
      const response = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setStatus("Não foi possível salvar o template.");
        return;
      }
      await loadTemplates();
      setOpenModal(false);
      setStatus("Template salvo com sucesso.");
    } catch {
      setStatus("Não foi possível salvar o template.");
    } finally {
      setLoading(false);
    }
  }

  async function activateTemplate(id: string) {
    const response = await apiFetch(`/api/document-templates/${id}/activate`, { method: "POST" });
    if (!response.ok) {
      setStatus("Falha ao ativar template.");
      return;
    }
    await loadTemplates();
    setStatus("Template ativado.");
  }

  async function deleteTemplate(id: string) {
    const response = await apiFetch(`/api/document-templates/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Falha ao remover template.");
      return;
    }
    await loadTemplates();
    setStatus("Template removido.");
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Configurações de Templates</h1>
          <p className="text-sm text-brand-navy-600">
            Gerencie templates de contrato e proposta, com variáveis dinâmicas.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-10 rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value as TemplateType)}
            >
              <option value="CONTRACT">Contrato</option>
              <option value="PROPOSAL">Proposta</option>
            </select>
            <select
              className="h-10 rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
              value={selectedActiveFilter}
              onChange={(event) =>
                setSelectedActiveFilter(event.target.value as "all" | "active" | "inactive")
              }
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <Button type="button" onClick={startCreate}>
              Novo template
            </Button>
          </div>

          <div className="grid gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-md border border-brand-navy-200 bg-white p-3 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-navy-900">{item.name}</p>
                  <p className="text-xs text-brand-navy-600">
                    Versão {item.version} • {item.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => startEdit(item)}>
                    Editar
                  </Button>
                  {!item.isActive ? (
                    <Button type="button" variant="outline" onClick={() => void activateTemplate(item.id)}>
                      Ativar
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" onClick={() => void deleteTemplate(item.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? (
              <div className="rounded-md border border-brand-navy-200 bg-brand-navy-50 p-3 text-sm text-brand-navy-600">
                Nenhum template encontrado para os filtros atuais.
              </div>
            ) : null}
          </div>

          {status ? <p className="text-sm text-brand-navy-700">{status}</p> : null}
        </CardContent>
      </Card>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={form.id ? "Editar template" : "Novo template"}
        size="max"
      >
        <div className="grid gap-4">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-1 md:col-span-2">
              <Label>Nome do template</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label>Tipo</Label>
              <select
                className="h-10 rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as TemplateType }))}
              >
                <option value="CONTRACT">Contrato</option>
                <option value="PROPOSAL">Proposta</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
            <TemplateEditor
              value={form.content}
              onChange={(content) => setForm((prev) => ({ ...prev, content }))}
              variables={variables}
            />
            <div className="rounded-md border border-brand-navy-200 bg-brand-navy-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-navy-900">Variáveis</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8"
                  onClick={() => setShowVariablesPanel((prev) => !prev)}
                >
                  {showVariablesPanel ? "Fechar" : "Abrir"}
                </Button>
              </div>
              {showVariablesPanel ? (
                <div className="grid max-h-[320px] gap-2 overflow-y-auto">
                  {variables.map((item) => (
                    <div key={item.placeholder} className="rounded-md border border-brand-navy-200 bg-white p-2">
                      <p className="text-xs font-semibold text-brand-navy-800">{item.placeholder}</p>
                      <p className="text-xs text-brand-navy-600">{item.description}</p>
                      <p className="text-xs text-brand-navy-500">Ex.: {item.example}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void saveTemplate()} disabled={loading}>
              {loading ? "Salvando..." : "Salvar template"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
