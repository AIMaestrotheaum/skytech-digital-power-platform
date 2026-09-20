import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  getAccessToken,
  getUserRole,
} from "../utils/auth";

export default function ProtectedRoute({
  allowedRoles = [],
}) {
  const location = useLocation();

  const token = getAccessToken();
  const role = getUserRole();

  // Not authenticated
  if (!token) {
    return (
      <Navigate
        to="/portal/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // Token exists but role is missing
  if (!role) {
    return (
      <Navigate
        to="/portal/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // User does not have permission for this section
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    if (role === "admin") {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    if (role === "customer") {
      return (
        <Navigate
          to="/portal/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/portal/login"
        replace
      />
    );
  }

  // Authorized
  return <Outlet />;
}