"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { apiFetch } from "@/lib/api";

type Project = {
  id: string;
  name: string;
  kWp?: number | string | null;
  status?: string | null;
  customerId?: string | null;
};

type Customer = {
  id: string;
  name: string;
};

type Payable = {
  id: string;
  projectId?: string | null;
  amount: number;
  status?: string | null;
};

type Receivable = {
  id: string;
  projectId?: string | null;
  amount: number;
};

type CashflowData = {
  forecast: { inflow: number; outflow: number };
  realized: { inflow: number; outflow: number };
};

type CostByCustomer = {
  items: Array<{ customerId: string | null; customerName: string; total: number }>;
};

function getYearRange() {
  const start = new Date();
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(11, 31);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [cashflow, setCashflow] = useState<CashflowData | null>(null);
  const [costByCustomer, setCostByCustomer] = useState<CostByCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { start, end } = getYearRange();
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    });

    Promise.all([
      apiFetch("/api/projects"),
      apiFetch("/api/customers"),
      apiFetch("/api/payables"),
      apiFetch("/api/receivables"),
      apiFetch(`/api/finance/reports/cashflow?${params.toString()}`),
      apiFetch(`/api/finance/reports/cost-by-customer?${params.toString()}`),
    ])
      .then(async (responses) => {
        const [
          projectsRes,
          customersRes,
          payablesRes,
          receivablesRes,
          cashflowRes,
          costRes,
        ] = responses;

        if (!active) return;

        setProjects(projectsRes.ok ? await projectsRes.json() : []);
        setCustomers(customersRes.ok ? await customersRes.json() : []);
        setPayables(payablesRes.ok ? await payablesRes.json() : []);
        setReceivables(receivablesRes.ok ? await receivablesRes.json() : []);
        setCashflow(cashflowRes.ok ? await cashflowRes.json() : null);
        setCostByCustomer(costRes.ok ? await costRes.json() : null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setProjects([]);
        setCustomers([]);
        setPayables([]);
        setReceivables([]);
        setCashflow(null);
        setCostByCustomer(null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [],
  );

  const customerMap = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer.name]));
  }, [customers]);

  const payablesByProject = useMemo(() => {
    return payables.reduce<Record<string, { total: number; paid: number; open: number }>>(
      (acc, payable) => {
        if (!payable.projectId) return acc;
        const current =
          acc[payable.projectId] ?? { total: 0, paid: 0, open: 0 };
        const amount = Number(payable.amount ?? 0);
        current.total += amount;
        if (payable.status === "PAID") {
          current.paid += amount;
        } else if (payable.status !== "CANCELLED") {
          current.open += amount;
        }
        acc[payable.projectId] = current;
        return acc;
      },
      {},
    );
  }, [payables]);

  const receivablesByProject = useMemo(() => {
    return receivables.reduce<Record<string, number>>((acc, receivable) => {
      if (!payable.projectId) return acc;
      acc[receivable.projectId] =
        (acc[receivable.projectId] ?? 0) + Number(receivable.amount ?? 0);
      return acc;
    }, {});
  }, [receivables]);

  const rows = useMemo(() => {
    return projects.map((project) => {
      const customerName = project.customerId
        ? customerMap.get(project.customerId) ?? project.customerId
        : "-";
      const receivableTotal = receivablesByProject[project.id] ?? 0;
      const payableSummary = payablesByProject[project.id] ?? {
        total: 0,
        paid: 0,
        open: 0,
      };
      const balance = receivableTotal - payableSummary.total;

      return {
        Nome: project.name ?? "-",
        kWp: String(project.kWp ?? "-"),
        Status: String(project.status ?? "-"),
        Cliente: customerName,
        Receber: currency.format(receivableTotal),
        Pagar: currency.format(payableSummary.total),
        Pago: currency.format(payableSummary.paid),
        "Em aberto": currency.format(payableSummary.open),
        "Ir para contas a pagar": payableSummary.open > 0 ? "/finance/payables" : "-",
        Saldo: currency.format(balance),
      };
    });
  }, [projects, customerMap, payablesByProject, receivablesByProject, currency]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Projetos</h1>
          <p className="text-sm text-slate-600">
            Dados técnicos e consolidação financeira por projeto.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Entrada prevista:{" "}
            {cashflow ? currency.format(cashflow.forecast.inflow) : loading ? "..." : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Saída prevista:{" "}
            {cashflow ? currency.format(cashflow.forecast.outflow) : loading ? "..." : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Entrada realizada:{" "}
            {cashflow ? currency.format(cashflow.realized.inflow) : loading ? "..." : "--"}
          </div>
          <div className="rounded-md border border-slate-200 p-4 text-sm">
            Saída realizada:{" "}
            {cashflow ? currency.format(cashflow.realized.outflow) : loading ? "..." : "--"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Custo por cliente</h2>
        </CardHeader>
        <CardContent>
          {costByCustomer ? (
            <div className="grid gap-2">
              {costByCustomer.items.length === 0 ? (
                <div className="text-sm text-slate-500">Sem custos registrados.</div>
              ) : (
                costByCustomer.items.map((item) => (
                  <div
                    key={item.customerId ?? item.customerName}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span>{item.customerName}</span>
                    <span>{currency.format(item.total)}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              {loading ? "Carregando..." : "Sem dados disponíveis."}
            </div>
          )}
        </CardContent>
      </Card>

      <DataTable
        title="Projetos"
        description="Visão completa com indicadores financeiros."
        newHref="/projects/budget/new"
        newLabel="Novo orçamento"
        columns={[
          { key: "Nome", label: "Nome" },
          { key: "kWp", label: "kWp" },
          { key: "Status", label: "Status" },
          { key: "Cliente", label: "Cliente" },
          { key: "Receber", label: "Receber" },
          { key: "Pagar", label: "Pagar" },
          { key: "Pago", label: "Pago" },
          { key: "Em aberto", label: "Em aberto" },
          { key: "Ir para contas a pagar", label: "Contas a pagar" },
          { key: "Saldo", label: "Saldo" },
        ]}
        rows={rows}
      />
    </div>
  );
}