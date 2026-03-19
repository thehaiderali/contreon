import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/authStore";

export const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuthStore();
  if (loading) return <p>Loading...</p>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};
