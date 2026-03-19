/**
 * Máscaras para campos de formulário.
 * Retorna o valor formatado e o valor apenas com dígitos (para envio à API).
 */

export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** CPF ou CNPJ: detecta pelo tamanho (11 = CPF, 14 = CNPJ) */
export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) return maskCpf(value);
  return maskCnpj(value);
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** Retorna apenas dígitos do documento (CPF/CNPJ) */
export function unmaskDocument(value: string): string {
  return value.replace(/\D/g, "");
}

/** Retorna apenas dígitos do telefone */
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscara de dinheiro em reais (R$).
 * Valor exibido: 1.234,56 (ponto para milhar, vírgula para decimal).
 * Aceita digitação e formata em tempo real.
 */
export function maskMoney(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length === 0) return "";
  const intPart = digits.slice(0, -2).replace(/^0+/, "") || "0";
  const decPart = digits.slice(-2).padStart(2, "0");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted},${decPart}`;
}

/**
 * Converte valor numérico (ex: da API) para string mascarada para exibição.
 * Aceita number, string ou Decimal/objeto (API/Prisma) e normaliza para número.
 * Não chama .toFixed no valor bruto para evitar erro quando amount vem como objeto.
 */
export function maskMoneyFromNumber(value: number | string | null | undefined | Record<string, unknown>): string {
  if (value == null) return "";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "";
  const fixed = n.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted},${decPart}`;
}

/**
 * Remove a máscara e retorna o número (para envio à API).
 */
export function parseMoney(value: string): number {
  if (!value || !value.trim()) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Formata valor vindo da API (number, string ou Decimal/objeto) para exibição em R$.
 * Evita "toFixed is not a function" quando amount vem como objeto (ex.: Prisma Decimal).
 */
export function formatAmountFromApi(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    return Number.isNaN(n) ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  const n = Number(value);
  return Number.isNaN(n) ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Aceita apenas dígitos (números inteiros). Útil para quantidade, código, etc.
 */
export function maskOnlyNumbers(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "");
  return maxLength != null ? digits.slice(0, maxLength) : digits;
}

/**
 * Aceita apenas números e um separador decimal (vírgula ou ponto). Útil para kWh, kWp, etc.
 */
export function maskDecimal(value: string, decimalPlaces = 2): string {
  const normalized = value.replace(",", ".");
  const match = normalized.match(/^(-?\d*)(\.?\d*)/);
  if (!match) return value;
  let [, intPart, decPart] = match;
  if (decPart.length > decimalPlaces) decPart = decPart.slice(0, decimalPlaces);
  if (decPart === ".") return intPart || "0";
  return decPart ? `${intPart || "0"}.${decPart}` : intPart || "";
}
