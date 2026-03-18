import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"

const Navbar = () => {
  return (
    <div className="bg-background/70 backdrop-blur-md border-b p-4 w-full flex justify-between items-center px-8 sticky top-0 z-50">
      
      {/* Left */}
      <div className="flex gap-6 items-center">
        <Link className="font-semibold text-lg">Brand</Link>

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

      {/* Right */}
      <div className="flex gap-4 items-center">
        
        {/* Login */}
        <Button variant="outline" asChild>
          <Link to="/login">Login</Link>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Get Started */}
        <Button asChild>
          <Link to="/signup">Get Started</Link>
        </Button>

      </div>
    </div>
  )
}

export default Navbar