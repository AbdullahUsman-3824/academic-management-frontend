import { createContext, useContext } from "react";

export const PortalContext = createContext(null);

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
}