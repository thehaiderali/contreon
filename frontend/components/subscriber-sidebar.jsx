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
  Settings
} from "lucide-react"

export function SubscriberAppSidebar() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/home" className="py-4 flex items-center gap-2 px-2">
          <div className="flex size-6 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <img src="./applogo.png" alt="logo" className="rounded-xl" />
          </div>
          Contreon
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <nav className="flex flex-col gap-2 px-2">
            <NavLink to="/home" className={({ isActive }) => 
              `hover:bg-muted p-2 rounded ${isActive ? 'bg-muted font-medium' : ''}`
            }>
              Home
            </NavLink>
            <NavLink to="/home/explore" className={({ isActive }) => 
              `hover:bg-muted p-2 rounded ${isActive ? 'bg-muted font-medium' : ''}`
            }>
              Explore
            </NavLink>
            <NavLink to="/home/chat" className={({ isActive }) => 
              `hover:bg-muted p-2 rounded ${isActive ? 'bg-muted font-medium' : ''}`
            }>
              Chat
            </NavLink>
            <NavLink to="/home/notifications" className={({ isActive }) => 
              `hover:bg-muted p-2 rounded ${isActive ? 'bg-muted font-medium' : ''}`
            }>
              Notifications
            </NavLink>
            <NavLink to="/home/settings" className={({ isActive }) => 
              `hover:bg-muted p-2 rounded ${isActive ? 'bg-muted font-medium' : ''}`
            }>
              Settings
            </NavLink>
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
                  {user?.fullName || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role || ""}
                </span>
              </div>
            </div>
            <ChevronUp className={`size-4 transition-transform ${showUserMenu ? '' : 'rotate-180'}`} />
          </div>

          {/* User menu dropdown */}
          {showUserMenu && (
            <div className="mt-1 p-1 rounded-lg border bg-card shadow-lg">
              <NavLink 
                to="/home/profile" 
                className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="size-4" />
                <span className="text-sm">Profile</span>
              </NavLink>
              
              <NavLink 
                to="/home/settings" 
                className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="size-4" />
                <span className="text-sm">Settings</span>
              </NavLink>
              
              <div className="h-px bg-border my-1" />
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 p-2 h-auto font-normal text-red-500 hover:text-red-600 hover:bg-red-50"
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
        
        <p className="text-xs px-2 pb-2 text-muted-foreground">
          © Contreon 2026
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}