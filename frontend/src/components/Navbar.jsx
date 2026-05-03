import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useAuthStore } from "@/store/authStore"
import { useState } from "react"
import { Loader2 } from "lucide-react" 
import { usePostHog } from "@posthog/react"

const Navbar = () => {
  const posthog=usePostHog()
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      posthog.capture("user_logged_out")
      navigate("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-background/70 backdrop-blur-md border-b p-3 md:p-4 w-full flex justify-between items-center px-4 md:px-8 sticky top-0 z-50 text-xs">
      <div className="flex gap-3 md:gap-6 items-center">
        <Link to="/" className="py-2 md:py-4 flex items-center gap-2 px-2">
          <div className="flex size-6 md:size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <img src="./applogo.png" alt="logo" className="object-cover rounded-xl" />
          </div>
          <span className="hidden sm:inline">Contreon</span>
        </Link>
        <a href="#features" className="hidden md:block hover:text-primary transition">
          Features
        </a>
        <a href="#pricing" className="hidden md:block hover:text-primary transition">
          Pricing
        </a>
      </div>

      <div className="flex gap-2 md:gap-4 items-center">
        {!user ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild className="sm:hidden">
              <Link to="/signup">Get Started</Link>
            </Button>
          </>
        ) : (
          <>
            {user.role === "subscriber" && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/home">Home</Link>
              </Button>
            )}
            
            {user.role === "creator" && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/creator">Dashboard</Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden sm:inline-flex"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="sm:hidden"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-xs">Logout</span>
              )}
            </Button>
          </>
        )}
        
        <ThemeToggle />
      </div>
    </div>
  )
}

export default Navbar