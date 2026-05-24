import api from "./api";

export type TypeTool = "CONSUMABLE" | "DAILY_USE";

export interface Tool {
  id: string;
  name: string;
  description: string;
  quantity: number;
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
