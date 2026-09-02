import { createContext, useContext } from "react";

export type Portal = "admin" | "student" | "teacher" | "parent";

interface PortalContextValue {
  portal: Portal;
}

export const PortalContext = createContext<PortalContextValue | null>(null);

export function usePortal(): PortalContextValue {
  const context = useContext(PortalContext);

  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }

  return context;
}