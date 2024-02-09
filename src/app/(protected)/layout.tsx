import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
    children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    return (
        <div className="w-full min-h-screen ">
            <Navbar className="md:fixed md:top-0 md:mb-0 fixed bottom-0 md:bottom-auto" />
            <div className="md:py-20 flex flex-col items-center justify-center min-h-screen
        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400 to-slate-950">
                {children}
            </div>
        </div>
    )
}

export default ProtectedLayout;