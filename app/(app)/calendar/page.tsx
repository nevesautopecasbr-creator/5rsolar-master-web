"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type WorkOrder = {
  id: string;
  title: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  status?: string | null;
};

type Payable = {
  id: string;
  description: string;
  dueDate: string;
  status?: string | null;
  amount: number;
};

type CalendarEvent = {
  id: string;
  dateKey: string;
  title: string;
  type: "task" | "payable";
  subtitle?: string;
  href?: string;
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function buildDateRangeKeys(start?: string | null, end?: string | null) {
  if (!start && !end) return [];
  if (start && !end) {
    const key = toDateKey(start);
    return key ? [key] : [];
  }
  if (!start && end) {
    const key = toDateKey(end);
    return key ? [key] : [];
  }
  const startDate = new Date(start ?? "");
  const endDate = new Date(end ?? "");
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];
  if (endDate < startDate) return [];
  const keys: string[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const last = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  while (current <= last) {
    const key = toDateKey(current.toISOString());
    if (key) keys.push(key);
    current.setDate(current.getDate() + 1);
  }
  return keys;
}

function buildMonthDays(reference: Date) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();
  const days: Array<{ date: Date | null; key: string }> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    days.push({ date: null, key: `empty-${i}` });
  }
  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    days.push({ date, key: toDateKey(date.toISOString()) });
  }
  return days;
}

export default function CalendarPage() {
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [tasks, setTasks] = useState<WorkOrder[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [showTasks, setShowTasks] = useState(true);
  const [showPayables, setShowPayables] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch("/api/work-orders"), apiFetch("/api/payables")])
      .then(async ([tasksRes, payablesRes]) => {
        const tasksData = tasksRes.ok ? await tasksRes.json() : [];
        const payablesData = payablesRes.ok ? await payablesRes.json() : [];
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/7c7a3af8-2979-4f40-9dcc-4e60fdd8a2be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(app)/calendar/page.tsx:103',message:'calendar_load_data',data:{tasksCount:Array.isArray(tasksData)?tasksData.length:0,payablesCount:Array.isArray(payablesData)?payablesData.length:0,firstTaskId:Array.isArray(tasksData)&&tasksData[0]?.id?tasksData[0].id:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C1'})}).catch(()=>{});
        // #endregion
        if (!active) return;
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setPayables(Array.isArray(payablesData) ? payablesData : []);
      })
      .catch(() => {
        if (!active) return;
        setTasks([]);
        setPayables([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const events = useMemo<CalendarEvent[]>(() => {
    const taskEvents = showTasks
      ? tasks
          .map((task) => {
            const dateKeys = buildDateRangeKeys(
              task.scheduledStart ?? null,
              task.scheduledEnd ?? null,
            );
            if (dateKeys.length === 0) return null;
            return dateKeys.map(
              (dateKey) =>
                ({
                  id: `task-${task.id}-${dateKey}`,
                  dateKey,
                  title: task.title,
                  type: "task",
                  subtitle: task.status ?? undefined,
                  href: `/works/orders/${task.id}`,
                }) satisfies CalendarEvent,
            );
          })
          .flat()
          .filter(Boolean)
      : [];

    const payableEvents = showPayables
      ? payables
          .map((payable) => ({
            id: `payable-${payable.id}`,
            dateKey: toDateKey(payable.dueDate),
            title: payable.description,
            type: "payable",
            subtitle: `R$ ${payable.amount.toFixed(2)}`,
            href: `/finance/payables/${payable.id}`,
          }))
          .filter((item) => item.dateKey)
      : [];

    return [...taskEvents, ...payableEvents] as CalendarEvent[];
  }, [tasks, payables, showPayables, showTasks]);

  const eventsByDay = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      acc[event.dateKey] = acc[event.dateKey] ? [...acc[event.dateKey], event] : [event];
      return acc;
    }, {});
  }, [events]);

  const monthDays = useMemo(() => buildMonthDays(referenceDate), [referenceDate]);

  const monthLabel = useMemo(() => {
    return referenceDate.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }, [referenceDate]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Calendário</h1>
            <p className="text-sm text-slate-600">
              Visualize tarefas e pagamentos em um único lugar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/works/orders/new">
              <Button type="button">Nova tarefa</Button>
            </Link>
            <Link href="/finance/payables/new">
              <Button type="button" variant="outline">
                Nova conta a pagar
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setReferenceDate(
                  new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1),
                )
              }
            >
              Mês anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setReferenceDate(
                  new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1),
                )
              }
            >
              Próximo mês
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="font-semibold capitalize">{monthLabel}</div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTasks}
                onChange={(event) => setShowTasks(event.target.checked)}
              />
              <Link href="/works/orders" className="text-slate-600 hover:text-slate-900">
                Tarefas
              </Link>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPayables}
                onChange={(event) => setShowPayables(event.target.checked)}
              />
              <Link href="/finance/payables" className="text-slate-600 hover:text-slate-900">
                Pagamentos a fazer
              </Link>
            </label>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs text-slate-500">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((label) => (
              <div key={label} className="text-center">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              if (!day.date) {
                return <div key={day.key} className="min-h-[110px]" />;
              }
              const dateKey = toDateKey(day.date.toISOString());
              const dayEvents = eventsByDay[dateKey] ?? [];
              return (
                <div key={day.key} className="min-h-[110px] rounded-md border border-slate-200 p-2">
                  <div className="text-xs font-semibold text-slate-500">
                    {day.date.getDate()}
                  </div>
                  <div className="mt-2 space-y-2">
                    {dayEvents.length === 0 ? (
                      <div className="text-xs text-slate-400">Sem eventos</div>
                    ) : (
                      dayEvents.map((event) => (
                        <Link
                          key={event.id}
                          href={event.href ?? "#"}
                          onClick={() => {
                            // #region agent log
                            fetch('http://127.0.0.1:7242/ingest/7c7a3af8-2979-4f40-9dcc-4e60fdd8a2be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(app)/calendar/page.tsx:266',message:'calendar_event_click',data:{eventType:event.type,href:event.href},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C2'})}).catch(()=>{});
                            // #endregion
                          }}
                          className={`rounded-md px-2 py-1 text-[11px] ${
                            event.type === "task"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <div className="font-semibold">{event.title}</div>
                          {event.subtitle ? (
                            <div className="text-[10px]">{event.subtitle}</div>
                          ) : null}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
