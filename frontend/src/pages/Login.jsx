import { GalleryVerticalEnd } from "lucide-react"
import { Link } from "react-router"
import { SignupForm } from "@/components/ui/signup-form"
import { LoginForm } from "@/components/ui/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <img src="./applogo.png" className="size-4" />
            </div>
            Contreon
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className=" text-white hidden bg-black lg:block">
        <div  className="flex justify-center items-center h-screen ">
            <div className="flex gap-5 ">
                <div className="rounded-full overflow-hidden">
              <img src="./applogo.png" className="size-18" />
            </div>
             <div className="text-7xl font-serif ">
                    Contreon
            </div>
            </div>

        </div>
      </div>
    </div>
  )
}
