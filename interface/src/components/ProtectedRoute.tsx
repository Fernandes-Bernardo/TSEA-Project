import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { isAdmin, isAuthenticated } from "../services/auth";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin = false }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default ProtectedRoute;
