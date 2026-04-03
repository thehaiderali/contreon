import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { NavLink, Link, useNavigate } from "react-router"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { 
  ChevronUp, 
  LogOut, 
  User,
  Settings,
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Wallet,
  MessageSquare,
  Moon,
  Sun
} from "lucide-react"

import { ThemeToggle } from "@/src/components/theme-toggle"
import { useTheme } from "@/hooks/use-theme"

export function CreatorSideBar() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuthStore()
  const {toggleTheme}=useTheme();
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const creatorNavItems = [
    { to: "/creator", label: "Dashboard", icon: LayoutDashboard },
    { to: "/creator/library", label: "Library", icon: BookOpen },
    { to: "/creator/members", label: "Members", icon: Users },
    { to: "/creator/insights", label: "Insights", icon: BarChart3 },
    { to: "/creator/payouts", label: "Payouts", icon: Wallet },
    { to: "/creator/messages", label: "Chats", icon: MessageSquare },
    { to: "/creator/settings", label: "Settings", icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/creator" className="py-4 flex items-center gap-2 px-2">
          <div className="flex size-6 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <img src="./applogo.png" alt="logo" className="rounded-xl" />
          </div>
          <span className="font-semibold">Contreon</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <nav className="flex flex-col gap-2 px-2">
            {creatorNavItems.map((item) => {
              const IconComponent = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <IconComponent className="size-4" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* User section with clickable username */}
        <div className="px-2 pb-2">
          <div 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.fullName || user?.name || user?.email || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </span>
                <span className="text-xs font-bold text-primary">
                  {user?.role || "Creator"}
                </span>
              </div>
            </div>
            <ChevronUp className={`size-4 transition-transform ${showUserMenu ? '' : 'rotate-180'}`} />
          </div>

          {/* User menu dropdown */}
          {showUserMenu && (
            <div className="mt-2 p-1 rounded-lg border bg-card shadow-lg">
              <NavLink 
                to="/creator/profile" 
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded transition-colors ${
                    isActive
                      ? 'bg-muted font-medium'
                      : 'hover:bg-muted'
                  }`
                }
                onClick={() => setShowUserMenu(false)}
              >
                <User className="size-4" />
                <span className="text-sm">Profile</span>
              </NavLink>
              
              <NavLink 
                to="/creator/settings" 
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded transition-colors ${
                    isActive
                      ? 'bg-muted font-medium'
                      : 'hover:bg-muted'
                  }`
                }
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="size-4" />
                <span className="text-sm">Settings</span>
              </NavLink>
              
              {/* Theme Toggle - Now properly aligned */}
              <div className="flex items-center gap-2 p-2 rounded transition-colors hover:bg-muted">
                <div className="size-4 -ml-6" />
                 <span className="text-xs"> Theme Switch </span> <ThemeToggle />
              </div>
              
              <div className="h-px bg-border my-1" />
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 p-2 h-auto font-normal text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={async () => {
                  setShowUserMenu(false)
                  await handleLogout()
                }}
              >
                <LogOut className="size-4" />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-xs px-2 pb-2 text-muted-foreground text-center">
          © Contreon 2026
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}