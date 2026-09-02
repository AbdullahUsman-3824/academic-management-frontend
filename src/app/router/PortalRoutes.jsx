import { useRoutes } from "react-router-dom";
import { usePortal } from "../providers/PortalContext";
import { studentRoutes } from "../../features/student/routes";
import { adminRoutes } from "../../features/admin/routes";
// import { facultyRoutes } from "../../features/faculty/routes";
// import { financeRoutes } from "../../features/finance/routes";

const portalRoutes = {
  student: studentRoutes,
  admin: adminRoutes,
  //   faculty: facultyRoutes,
  //   finance: financeRoutes,
};

export function PortalRoutes() {
  const { portal } = usePortal();

  const routes = portalRoutes[portal] ?? portalRoutes.student;

  const Layout = routes.layout;

  return useRoutes([
    {
      path: "/",
      element: <Layout />,
      children: routes.children,
    },
  ]);
}
