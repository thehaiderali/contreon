import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CreatorSideBar } from "@/components/app-sidebar"
import { Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"
import { SubscriberAppSidebar } from "@/components/subscriber-sidebar"
import { Toaster } from "sonner"

export default function Home() {

  const {user}=useAuthStore()    
  

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Toaster position="top-center"/>
          {user?.role==="creator" && (<CreatorSideBar/>)}
          {user?.role==="subscriber" && (<SubscriberAppSidebar/>)}
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