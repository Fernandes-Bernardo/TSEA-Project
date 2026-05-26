import api from "./api";

export type TypeTool = "CONSUMABLE" | "DAILY_USE";

export interface Tool {
  id: string;
  name: string;
  description: string;
  quantity: number;
  minQuantity: number;
  type: TypeTool;
  levelSecurity: string;
  imagePath?: string | null;
  dateCreation?: string;
  dateUpdate?: string;
}

export interface ToolPayload {
  name: string;
  description: string;
  quantity: number;
  minQuantity: number;
  type: TypeTool;
  levelSecurity: string;
}

export const toolsApi = {
  list: () => api.get<Tool[]>("/api/tools").then((r) => r.data),
  getById: (id: string) => api.get<Tool>(`/api/tools/${id}`).then((r) => r.data),
  search: (name: string) =>
    api.get<Tool[]>("/api/tools/search", { params: { name } }).then((r) => r.data),
  create: (data: ToolPayload) => api.post<Tool>("/api/tools", data).then((r) => r.data),
  update: (id: string, data: Partial<ToolPayload>) =>
    api.put<void>(`/api/tools/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete<void>(`/api/tools/${id}`).then((r) => r.data),
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<Tool>(`/api/tools/${id}/image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  imageUrl: (id: string) => {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    return `${base}/api/tools/${id}/image`;
  },
};

/**
 * Converte o valor livre de levelSecurity (low/medium/high, baixo/médio/alto, etc.)
 * para o label padronizado em PT-BR.
 */
export function levelSecurityLabel(raw: string | null | undefined): string {
  if (!raw) return "-";
  const v = raw.trim().toLowerCase();
  if (["low", "baixo", "baixa", "1"].includes(v)) return "Baixo";
  if (["medium", "med", "médio", "medio", "média", "media", "2"].includes(v)) return "Médio";
  if (["high", "alto", "alta", "3"].includes(v)) return "Alto";
  return raw;
}

export function levelSecurityColor(raw: string | null | undefined): string {
  const label = levelSecurityLabel(raw);
  switch (label) {
    case "Baixo":
      return "text-green-700 bg-green-100";
    case "Médio":
      return "text-orange-700 bg-orange-100";
    case "Alto":
      return "text-red-700 bg-red-100";
    default:
      return "text-gray-700 bg-gray-200";
  }
}

export function isLowStock(tool: Tool): boolean {
  return tool.minQuantity > 0 && tool.quantity <= tool.minQuantity && tool.quantity > 0;
}

export function isOutOfStock(tool: Tool): boolean {
  return tool.quantity === 0;
}
