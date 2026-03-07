/**
 * Estados e municípios do Brasil via API IBGE.
 * Estados: https://servicodados.ibge.gov.br/api/v1/localidades/estados
 * Municípios por estado: https://servicodados.ibge.gov.br/api/v1/localidades/estados/{id}/municipios
 */

const IBGE_ESTADOS = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";

export type Estado = { id: number; sigla: string; nome: string };
export type Municipio = { id: number; nome: string };

let estadosCache: Estado[] | null = null;
const municipiosCache = new Map<number, Municipio[]>();

export async function fetchEstados(): Promise<Estado[]> {
  if (estadosCache) return estadosCache;
  const res = await fetch(IBGE_ESTADOS);
  if (!res.ok) return [];
  const data = await res.json();
  estadosCache = data as Estado[];
  return estadosCache;
}

export async function fetchMunicipiosByEstadoId(estadoId: number): Promise<Municipio[]> {
  const cached = municipiosCache.get(estadoId);
  if (cached) return cached;
  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`
  );
  if (!res.ok) return [];
  const data = await res.json();
  const list = (data as Municipio[]) ?? [];
  municipiosCache.set(estadoId, list);
  return list;
}

/** Retorna o id do estado pela sigla (UF), para uso ao buscar municípios */
export function getEstadoIdBySigla(estados: Estado[], sigla: string): number | undefined {
  const uf = sigla.trim().toUpperCase();
  return estados.find((e) => e.sigla === uf)?.id;
}
