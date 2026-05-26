import api from "./api";
import type { TypeTool } from "./tools";

export type LoanStatus = "REQUESTED" | "DELIVERED" | "RETURNED" | "CANCELLED";

export interface LoanItem {
  id: string;
  toolId: string;
  toolName: string;
  toolType: TypeTool;
  quantity: number;
  returnedQuantity: number;
}

export interface Loan {
  id: string;
  employeeId: number;
  responsibleName: string;
  status: LoanStatus;
  deliveredByEmployeeId: number | null;
  notes: string | null;
  requestedAt: string;
  deliveredAt: string | null;
  returnedAt: string | null;
  items: LoanItem[];
}

export interface LoanItemPayload {
  toolId: string;
  quantity: number;
}

export interface LoanPayload {
  employeeId: number;
  items: LoanItemPayload[];
  notes?: string;
}

export const loansApi = {
  listAll: () => api.get<Loan[]>("/api/loans").then((r) => r.data),
  listPending: () => api.get<Loan[]>("/api/loans/pending").then((r) => r.data),
  listActive: () => api.get<Loan[]>("/api/loans/active").then((r) => r.data),
  listMine: () => api.get<Loan[]>("/api/loans/me").then((r) => r.data),
  listByEmployee: (employeeId: number) =>
    api.get<Loan[]>(`/api/loans/employee/${employeeId}`).then((r) => r.data),
  getById: (id: string) => api.get<Loan>(`/api/loans/${id}`).then((r) => r.data),
  create: (payload: LoanPayload) => api.post<Loan>("/api/loans", payload).then((r) => r.data),
  deliver: (id: string, scannedEmployeeId: number) =>
    api.put<Loan>(`/api/loans/${id}/deliver`, { scannedEmployeeId }).then((r) => r.data),
  returnItem: (id: string, loanItemId: string, quantity: number) =>
    api.put<Loan>(`/api/loans/${id}/return-item`, { loanItemId, quantity }).then((r) => r.data),
  returnAll: (id: string) => api.put<Loan>(`/api/loans/${id}/return`).then((r) => r.data),
  cancel: (id: string) => api.delete<Loan>(`/api/loans/${id}`).then((r) => r.data),
};

/**
 * Verdadeiro quando o empréstimo tem apenas itens consumíveis
 * (não admite devolução manual).
 */
export function isConsumableOnly(loan: Loan): boolean {
  if (!loan.items || loan.items.length === 0) return false;
  return loan.items.every((i) => i.toolType === "CONSUMABLE");
}

export function statusLabel(status: LoanStatus): string {
  switch (status) {
    case "REQUESTED":
      return "Aguardando entrega";
    case "DELIVERED":
      return "Em uso";
    case "RETURNED":
      return "Concluído";
    case "CANCELLED":
      return "Cancelado";
  }
}
