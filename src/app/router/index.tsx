import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../../features/common/LoginPage";
import { PortalProvider } from "../providers/PortalProvider";
import { PortalRoutes } from "./PortalRoutes";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <PortalProvider />,
    children: [
      {
        path: "/*",
        element: <PortalRoutes />,
      },
    ],
  },
]);
