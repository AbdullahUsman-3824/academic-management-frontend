import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { PortalContext, Portal } from "./PortalContext";

export function PortalProvider() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const portal = user.portal.toLowerCase() as Portal;

  return (
    <PortalContext.Provider value={{ portal }}>
      <Outlet />
    </PortalContext.Provider>
  );
}
