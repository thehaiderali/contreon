import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  )
}