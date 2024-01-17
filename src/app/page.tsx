import { LoginButton } from "@/components/auth/login-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"

const font = Poppins({
  subsets: ['latin'],
  weight: ['600']
})
export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center 
    bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400 to-slate-950">
      <div className="space-y-6 text-center">
        <h1 className={cn("text-6xl font-semibold text-white drop-shadow-md uppercase", font.className)}>
        <span className="text-yellow-300">Lava</span> Car <span className="text-slate-950">Central</span>
        </h1>
        <LoginButton mode="modal" asChild>
          <Button variant="secondary" size="lg">Entrar</Button>
        </LoginButton>
      </div>
    </main>

  )
}
