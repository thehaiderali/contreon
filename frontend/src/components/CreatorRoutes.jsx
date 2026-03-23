import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/authStore";

export const CreatorRoutes = () => {
  const { user, loading } = useAuthStore();
  if (loading) return <p>Loading...</p>;
  if (user.role!=="creator") return <Navigate to="/home" replace />;
  return <Outlet />;
};
