import AdminDashboard from "./pages/AdminDashboard";
import { Outlet } from "react-router-dom";
const AdminLayout = () => <Outlet />;

export const adminRoutes = {
  layout: AdminLayout,
  children: [
    {
      index: true,
      element: <AdminDashboard />,
    },
  ],
};
