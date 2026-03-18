import { GalleryVerticalEnd } from "lucide-react"
import { Link } from "react-router"
import { LoginForm } from "@/components/ui/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Column - Login Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          {/* Add logo/link here if needed */}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right Column - Branding with Quote */}
      <div className="hidden bg-black lg:block sticky top-0 h-screen">
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col gap-8 max-w-md px-8">
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-5">
              <div className="rounded-full overflow-hidden">
                <img src="./applogo.png" className="w-18 h-18 object-cover" alt="logo" />
              </div>
              <div className="text-7xl font-serif text-white">
                Contreon
              </div>
            </div>
            
            {/* Quote */}
            <div className="text-white/80 text-xl italic leading-relaxed text-center">
              <span className="text-primary text-3xl">"</span>
              Where creators and fans build meaningful connections
              <span className="text-primary text-3xl">"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}