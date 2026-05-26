import api from "./api";

export type Role = "ROLE_ADMIN" | "ROLE_USER" | "ROLE_ALMOXARIFE";

export interface AuthUser {
  employeeId: number;
  role: Role;
}

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function login(employeeId: number, password: string): Promise<AuthUser> {
  const { data } = await api.post<{ token: string }>("/api/auth/login", {
    employeeId,
    password,
  });
  localStorage.setItem("token", data.token);
  const payload = decodeJwt(data.token);
  if (!payload) throw new Error("Token inválido");
  const user: AuthUser = {
    employeeId: Number(payload.sub),
    role: payload.role as Role,
  };
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload) return false;
  return payload.exp * 1000 > Date.now();
}

export function isAdmin(): boolean {
  return getCurrentUser()?.role === "ROLE_ADMIN";
}

export function isAlmoxarife(): boolean {
  return getCurrentUser()?.role === "ROLE_ALMOXARIFE";
}

export function isUser(): boolean {
  return getCurrentUser()?.role === "ROLE_USER";
}

/**
 * Caminho inicial baseado na role do usuário.
 */
export function homePathForRole(role: Role | undefined): string {
  switch (role) {
    case "ROLE_ADMIN":
      return "/admin";
    case "ROLE_ALMOXARIFE":
      return "/almoxarife";
    default:
      return "/";
  }
}
