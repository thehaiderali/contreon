import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"

const Navbar = () => {
  return (
    <div className="bg-background/70 backdrop-blur-md border-b p-4 w-full flex justify-between items-center px-8 sticky top-0 z-50">
      <div className="flex gap-6 items-center">
        <Link to="/" className="py-4 flex items-center gap-2 px-2">
            <div className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <img src="./applogo.png"  alt="logo" className="object-cover rounded-xl " />
            </div>
            Contreon </Link>
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

        <Button variant="outline" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/signup">Get Started</Link>
        </Button>
      <ThemeToggle />


      </div>
    </div>
  )
}

export default Navbar