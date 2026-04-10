"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ModuleForm } from "@/components/module-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { maskMoney, maskMoneyFromNumber, parseMoney } from "@/lib/masks";

type PayableRow = {
  id: string;
  description: string;
  amount: number | string | null;
  dueDate: string;
  projectId?: string | null;
  supplierId?: string | null;
  purchaseOrderId?: string | null;
  accountId?: string | null;
  status?: string | null;
  paidAt?: string | null;
  paymentMethod?: string | null;
  isDirectCost?: boolean | null;
  type?: string | null;
  recurrenceRule?: string | null;
  nextDueDate?: string | null;
};

const PAYABLE_STATUS = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "OPEN", label: "Em aberto" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "PAID", label: "Pago" },
  { value: "OVERDUE", label: "Vencido" },
  { value: "CANCELLED", label: "Cancelado" },
];

const PAYMENT_METHODS = [
  { value: "PIX", label: "PIX" },
  { value: "CARTAO", label: "Cartão" },
  { value: "BOLETO", label: "Boleto" },
  { value: "DINHEIRO", label: "Dinheiro" },
];

const PAYABLE_TYPES = [
  { value: "MATERIAL", label: "Material" },
  { value: "SERVICE", label: "Serviço" },
  { value: "LABOR", label: "Mão de obra" },
  { value: "OTHER", label: "Outro" },
];

export default function PayableDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [orders, setOrders] = useState<Array<{ id: string }>>([]);
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [isDirectCost, setIsDirectCost] = useState(false);
  const [type, setType] = useState("OTHER");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch("/api/projects").then((r) => (r.ok ? r.json() : [])),
      apiFetch("/api/suppliers").then((r) => (r.ok ? r.json() : [])),
      apiFetch("/api/purchase-orders").then((r) => (r.ok ? r.json() : [])),
      apiFetch("/api/chart-accounts").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, s, o, a]) => {
        if (!active) return;
        setProjects(Array.isArray(p) ? p : []);
        setSuppliers(Array.isArray(s) ? s : []);
        setOrders(Array.isArray(o) ? o : []);
        setAccounts(Array.isArray(a) ? a : []);
      })
      .catch(() => {
        if (!active) return;
        setProjects([]);
        setSuppliers([]);
        setOrders([]);
        setAccounts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setMessage(null);
    apiFetch(`/api/payables/${id}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<PayableRow>;
      })
      .then((data) => {
        if (!active) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setDescription(data.description ?? "");
        setAmount(maskMoneyFromNumber(data.amount));
        setDueDate(data.dueDate ? String(data.dueDate).slice(0, 10) : "");
        setProjectId(data.projectId ?? "");
        setSupplierId(data.supplierId ?? "");
        setPurchaseOrderId(data.purchaseOrderId ?? "");
        setAccountId(data.accountId ?? "");
        setStatus(data.status ?? "OPEN");
        setPaymentMethod(data.paymentMethod ?? "");
        setPaidAt(data.paidAt ? String(data.paidAt).slice(0, 10) : "");
        setIsDirectCost(Boolean(data.isDirectCost));
        setType(data.type ?? "OTHER");
        setRecurrenceRule(data.recurrenceRule ?? "");
        setNextDueDate(data.nextDueDate ? String(data.nextDueDate).slice(0, 10) : "");
      })
      .catch(() => {
        if (!active) return;
        setMessage("Falha ao carregar conta a pagar.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit() {
    setSaving(true);
    setMessage(null);
    const amountNum = parseMoney(amount);
    const payload: Record<string, unknown> = {
      description: description.trim(),
      amount: amountNum,
      dueDate: dueDate || undefined,
      projectId: projectId || undefined,
      supplierId: supplierId || undefined,
      purchaseOrderId: purchaseOrderId || undefined,
      accountId: accountId || undefined,
      status: status || undefined,
      paymentMethod: paymentMethod || undefined,
      paidAt: paidAt || undefined,
      isDirectCost,
      type: type || undefined,
      recurrenceRule: recurrenceRule.trim() || undefined,
      nextDueDate: nextDueDate || undefined,
    };

    const response = await apiFetch(`/api/payables/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("Falha ao salvar alterações.");
      setSaving(false);
      return;
    }

    setMessage("Alterações salvas.");
    setSaving(false);
  }

  if (loading) {
    return (
      <ModuleForm title="Conta a pagar" description="Carregando...">
        <p className="text-sm text-brand-navy-600">Carregando dados...</p>
      </ModuleForm>
    );
  }

  if (notFound) {
    return (
      <ModuleForm title="Conta a pagar" description="Registro não encontrado">
        <p className="text-sm text-brand-navy-600">
          Não foi possível localizar esta conta a pagar ou você não tem permissão para vê-la.
        </p>
        <Link href="/finance/payables" className="text-sm text-brand-orange underline">
          Voltar para contas a pagar
        </Link>
      </ModuleForm>
    );
  }

  return (
    <ModuleForm title="Conta a pagar" description="Visualizar e editar lançamento">
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/calendar" className="text-brand-orange underline">
          Calendário
        </Link>
        <span className="text-brand-navy-400">|</span>
        <Link href="/finance/payables" className="text-brand-orange underline">
          Lista de contas a pagar
        </Link>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(maskMoney(e.target.value))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dueDate">Vencimento</Label>
        <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <Label>Projeto</Label>
        <select
          className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">Nenhum</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Fornecedor</Label>
        <select
          className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          <option value="">Nenhum</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Pedido de compra</Label>
        <select
          className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
          value={purchaseOrderId}
          onChange={(e) => setPurchaseOrderId(e.target.value)}
        >
          <option value="">Nenhum</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Conta contábil</Label>
        <select
          className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Nenhuma</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Status</Label>
        <select
          className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {PAYABLE_STATUS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Forma de pagamento</Label>
        <select
          className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Não informado</option>
          {PAYMENT_METHODS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="paidAt">Pagamento em</Label>
        <Input id="paidAt" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-navy-700">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={isDirectCost}
          onChange={(e) => setIsDirectCost(e.target.checked)}
        />
        Custo direto
      </label>

      <div className="grid gap-2">
        <Label>Tipo</Label>
        <select
          className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {PAYABLE_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="recurrenceRule">Recorrência</Label>
        <Input
          id="recurrenceRule"
          value={recurrenceRule}
          onChange={(e) => setRecurrenceRule(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nextDueDate">Próximo vencimento</Label>
        <Input
          id="nextDueDate"
          type="date"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
        />
      </div>

      {message ? <p className="text-sm text-brand-navy-600">{message}</p> : null}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={saving || !description.trim() || !dueDate}
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </ModuleForm>
  );
}
