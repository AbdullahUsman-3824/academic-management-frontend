import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface ProtectedRouteProps {
  allowedPortals?: string[];
}

const ProtectedRoute = ({ allowedPortals }: ProtectedRouteProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong portal
  if (allowedPortals && !allowedPortals.includes(user.portal?.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;