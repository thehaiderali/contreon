
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { LoginForm } from "@/components/ui/login-form";

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  console.log("📊 LoginPage render - isAuthenticated:", isAuthenticated);

  // ✅ SINGLE EFFECT: Watch isAuthenticated and redirect if true
  useEffect(() => {
    console.log("🔄 LoginPage useEffect - isAuthenticated:", isAuthenticated);
    if (isAuthenticated === true) {
      console.log("✅ User authenticated, navigating to /home");
      navigate("/creator", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (formData) => {
    console.log("📝 Login form submitted");
    try {
      await login(formData);
      console.log("✅ Login completed successfully");
      // Don't navigate manually - let useEffect handle it when isAuthenticated changes
    } catch (err) {
      console.error("❌ Login error:", err.message);
      // Error is already in store.error and will be displayed by LoginForm
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column - Login Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          {/* Add logo/link here if needed */}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Right Column - Branding */}
      <div className="hidden bg-black lg:block sticky top-0 h-screen">
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col gap-8 max-w-md px-8">
            <div className="flex items-center gap-5">
              <div className="rounded-full overflow-hidden">
                <img
                  src="./applogo.png"
                  className="w-18 h-18 object-cover"
                  alt="logo"
                />
              </div>
              <div className="text-7xl font-serif text-white">Contreon</div>
            </div>

            <div className="text-white/80 text-xl italic leading-relaxed text-center">
              <span className="text-primary text-3xl">"</span>
              Where creators and fans build meaningful connections
              <span className="text-primary text-3xl">"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}