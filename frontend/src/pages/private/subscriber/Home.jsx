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
          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
            <SidebarTrigger />
          </div>
          <div className="py-6 px-3 md:py-10 md:px-4 pt-14 md:pt-16 max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}