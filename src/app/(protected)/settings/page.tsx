"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { useCurrentUser } from "@/hooks/use-current-user";
const SettingsPage = () => {
    const currentUser = useCurrentUser();

    return (
        <div className="bg-white p-10 rounded-xl">
            <LogoutButton>
                Sair
            </LogoutButton>
        </div>
    )
}

export default SettingsPage;