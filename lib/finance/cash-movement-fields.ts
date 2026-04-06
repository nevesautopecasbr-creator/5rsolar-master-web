import type { FormField } from "@/components/dynamic-form";

export const CASH_MOVEMENT_FIELDS: FormField[] = [
  {
    name: "cashAccountId",
    label: "Conta caixa",
    type: "select",
    optionsUrl: "/api/cash-accounts",
    optionValueKey: "id",
    optionLabelKey: "name",
    required: true,
    newAccountTrigger: "cash",
  },
  {
    name: "direction",
    label: "Direção",
    type: "select",
    defaultValue: "IN",
    required: true,
    options: [
      { value: "IN", label: "Entrada" },
      { value: "OUT", label: "Saída" },
    ],
  },
  { name: "amount", label: "Valor (R$)", type: "text", mask: "money", required: true },
  { name: "movementDate", label: "Data", type: "date", required: true },
  { name: "description", label: "Descrição", type: "text" },
  {
    name: "projectId",
    label: "Projeto",
    type: "select",
    optionsUrl: "/api/projects",
    optionValueKey: "id",
    optionLabelKey: "name",
  },
  {
    name: "accountId",
    label: "Conta contábil",
    type: "select",
    optionsUrl: "/api/chart-accounts",
    optionValueKey: "id",
    optionLabelKey: "name",
    newAccountTrigger: "chart",
  },
];
