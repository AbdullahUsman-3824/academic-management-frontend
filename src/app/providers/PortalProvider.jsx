import { Outlet } from "react-router-dom";
import { PortalContext } from "./PortalContext";

export function PortalProvider() {
  const portal = "student";
  return (
    <PortalContext.Provider value={{ portal }}>
      <Outlet />
    </PortalContext.Provider>
  );
}
