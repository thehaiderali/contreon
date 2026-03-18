// 

import { GalleryVerticalEnd } from "lucide-react"
import { Link } from "react-router"
import { SignupForm } from "@/components/ui/signup-form"

export default function SignupPage() {
  return (
    <div className="grid h-screen lg:grid-cols-2">
      {/* Left Column - Signup Form (Scrollable) */}
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          {/* Add your logo/link here if needed */}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>

      {/* Right Column - Branding (Sticky) */}
      <div className="hidden bg-black lg:block h-screen sticky top-0">
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
           <div className="text-white/40 text-sm text-center mt-4">
              Join thousands of creators already on Contreon
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}