import api from "./api";
import type { TypeTool } from "./tools";

export interface Transaction {
  id: number;
  employee_id: number;
  responsible: string;
  toolId: string;
  toolName: string;
  toolType: TypeTool;
  toolQuantity: number;
  status: boolean;
  caughtDate: string;
  returnedDate: string | null;
}

export interface TransactionPayload {
  employeeId: number;
  toolName: string;
  toolQuantity: number;
}

export const transactionsApi = {
  list: () => api.get<Transaction[]>("/api/transacoes").then((r) => r.data),
  listPending: () => api.get<Transaction[]>("/api/transacoes/pending").then((r) => r.data),
  getById: (id: number) =>
    api.get<Transaction>(`/api/transacoes/${id}`).then((r) => r.data),
  getByResponsible: (responsible: string) =>
    api
      .get<Transaction[]>(`/api/transacoes/responsible/${responsible}`)
      .then((r) => r.data),
  getByEmployee: (employeeId: number) =>
    api.get<Transaction[]>(`/api/transacoes/employee/${employeeId}`).then((r) => r.data),
  create: (data: TransactionPayload) =>
    api.post<Transaction>("/api/transacoes", data).then((r) => r.data),
  confirmReturn: (id: number) =>
    api.put<Transaction>(`/api/transacoes/return/${id}`).then((r) => r.data),
};
