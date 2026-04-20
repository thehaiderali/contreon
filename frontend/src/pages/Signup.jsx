// SignupPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { SignupForm } from "@/components/ui/signup-form";

export default function SignupPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signup = useAuthStore((state) => state.signup);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  console.log("📊 SignupPage render - isAuthenticated:", isAuthenticated);
  useEffect(() => {
    console.log("🔄 SignupPage useEffect - isAuthenticated:", isAuthenticated);
    if (isAuthenticated === true) {
      console.log("✅ User already authenticated, navigating to /home");
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (formData) => {
    console.log("📝 Signup form submitted");
    try {
      await signup(formData);
      console.log("✅ Signup completed successfully, navigating to /login");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("❌ Signup error:", err.message);
      // Error is already in store.error and will be displayed by SignupForm
    }
  };

  return (
    <div className="grid h-screen lg:grid-cols-2">
      {/* Left Column - Signup Form (Scrollable) */}
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          {/* Add your logo/link here if needed */}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm 
              onSubmit={handleSignup} 
              loading={loading} 
              error={error} 
            />
          </div>
        </div>
      </div>

      {/* Right Column - Branding */}
      <div className="hidden bg-black lg:block h-screen sticky top-0">
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col gap-8 max-w-md px-8">
            {/* Logo and Brand Name */}
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
            <div className="text-white/40 text-sm text-center mt-4">
              Join thousands of creators already on Contreon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}