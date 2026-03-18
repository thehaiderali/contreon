import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { NavLink } from "react-router"
import { Link } from "react-router"

export function SubscriberAppSidebar() {
  return (
    <Sidebar>
            <SidebarHeader>
            <Link to="/home" className="py-4 flex items-center gap-2 px-2">
            <div className="flex size-6 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <img src="./applogo.png"  alt="logo" className="rounded-xl" />
            </div>
            Contreon </Link>
        </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <nav className="flex flex-col gap-2 px-2">
            <NavLink to="/home" className="hover:bg-muted p-2 rounded">
              Home
            </NavLink>
            <NavLink to="/home/explore" className="hover:bg-muted p-2 rounded">
              Explore
            </NavLink>
            <NavLink to="/home/chat" className="hover:bg-muted p-2 rounded">
              Chat
            </NavLink>
            <NavLink to="/home/notifications" className="hover:bg-muted p-2 rounded">
              Notifications
            </NavLink>
            <NavLink to="/home/settings" className="hover:bg-muted p-2 rounded">
              Settings
            </NavLink>
          </nav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-xs px-2">© Contreon 2026</p>
      </SidebarFooter>
    </Sidebar>
  )
}