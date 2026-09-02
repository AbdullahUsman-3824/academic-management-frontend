import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../../features/common/LoginPage";
import { PortalProvider } from "../providers/PortalProvider";
import { PortalRoutes } from "./PortalRoutes";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PortalProvider />,
        children: [
          {
            path: "/*",
            element: <PortalRoutes />,
          },
        ],
      },
    ],
  },
]);
