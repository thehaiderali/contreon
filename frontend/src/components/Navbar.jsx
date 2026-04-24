import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useAuthStore } from "@/store/authStore"
import { useState } from "react"
import { Loader2 } from "lucide-react" // Make sure to install lucide-react: npm install lucide-react

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(); // Call the logout function from your store
      navigate("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-background/70 backdrop-blur-md border-b p-4 w-full flex justify-between items-center px-8 sticky top-0 z-50 text-xs">
      <div className="flex gap-6 items-center">
        <Link to="/" className="py-4 flex items-center gap-2 px-2">
          <div className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <img src="./applogo.png" alt="logo" className="object-cover rounded-xl" />
          </div>
          Contreon
        </Link>
        <Link to="#" className="hover:text-primary transition">
          Creators
        </Link>
        <Link to="#" className="hover:text-primary transition">
          Features
        </Link>
        <Link to="#" className="hover:text-primary transition">
          Pricing
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        {!user ? (
          // Show Login and Get Started for non-authenticated users
          <>
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </>
        ) : (
          // Show role-specific navigation for authenticated users
          <>
            {user.role === "subscriber" && (
              <Button variant="outline" asChild>
                <Link to="/home">Home</Link>
              </Button>
            )}
            
            {user.role === "creator" && (
              <Button variant="outline" asChild>
                <Link to="/creator">Dashboard</Link>
              </Button>
            )}
            
            {/* Logout button with loading spinner */}
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              disabled={isLoggingOut}
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
          </>
        )}
        
        <ThemeToggle />
      </div>
    </div>
  )
}

export default Navbar