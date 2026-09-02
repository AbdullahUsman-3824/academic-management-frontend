import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Navigate } from "react-router-dom";
import AdminDashboard from "../../features/admin/pages/AdminDashboard";

const PortalProvider = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const portal = user.portal?.toUpperCase();

  // Only Admin for now
  if (portal === "ADMIN") {
    return <AdminDashboard />;
  }

  // Any other portal → for now just send to login
  return <Navigate to="/login" replace />;
};

export default PortalProvider;