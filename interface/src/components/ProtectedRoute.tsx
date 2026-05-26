import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getCurrentUser, homePathForRole, isAuthenticated, type Role } from "../services/auth";

interface Props {
  children: ReactNode;
  roles?: Role[];
}

function ProtectedRoute({ children, roles }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0) {
    const user = getCurrentUser();
    if (!user || !roles.includes(user.role)) {
      return <Navigate to={homePathForRole(user?.role)} replace />;
    }
  }
  return <>{children}</>;
}

export default ProtectedRoute;
