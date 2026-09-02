import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../../features/common/LoginPage";
import PortalProvider from "../providers/PortalProvider";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <PortalProvider />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);