import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
    children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    return (
        <>
            <Navbar className="md:fixed md:top-0 md:mb-0 fixed bottom-0 md:bottom-auto" />
            <div className="w-full py-20 min-h-screen flex flex-col items-center justify-center
        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
                {children}
            </div>
        </>
    )
}

export default ProtectedLayout;