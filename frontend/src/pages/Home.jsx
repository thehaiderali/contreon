import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SubscriberAppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router"

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SubscriberAppSidebar />
        <main className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10">
            <SidebarTrigger />
          </div>
          <div className="py-10 px-4 pt-16">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}