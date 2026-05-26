import api from "./api";

export type Role = "ROLE_ADMIN" | "ROLE_USER" | "ROLE_ALMOXARIFE";

export interface User {
  id: string;
  name: string;
  employeeId: number;
  role: Role;
  sector: string;
}

export interface UserPayload {
  name: string;
  role: Role;
  sector: string;
  password: string;
}

export const usersApi = {
  list: () => api.get<User[]>("/api/users").then((r) => r.data),
  getByEmployeeId: (employeeId: number) =>
    api.get<User>(`/api/users/${employeeId}`).then((r) => r.data),
  searchByName: (name: string) =>
    api.get<User[]>("/api/users/search", { params: { name } }).then((r) => r.data),
  create: (data: UserPayload) => api.post<User>("/api/users", data).then((r) => r.data),
  remove: (employeeId: number) =>
    api.delete<void>(`/api/users/${employeeId}`).then((r) => r.data),
};

export function roleLabel(role: Role): string {
  switch (role) {
    case "ROLE_ADMIN":
      return "Administrador";
    case "ROLE_ALMOXARIFE":
      return "Almoxarife";
    case "ROLE_USER":
      return "Usuário";
  }
}
