import api from "./api";

/**
 * Cache local da lista de setores: a lista vem do backend uma vez e é
 * reusada por todos os componentes na mesma sessão.
 */
let cache: string[] | null = null;

export async function listSectors(): Promise<string[]> {
  if (cache) return cache;
  const { data } = await api.get<string[]>("/api/sectors");
  cache = data;
  return data;
}

export function clearSectorsCache() {
  cache = null;
}
