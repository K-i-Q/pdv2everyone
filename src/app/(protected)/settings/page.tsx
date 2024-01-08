"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
const SettingsPage = () => {
    const currentUser = useCurrentUser();

    return (
        <div className="bg-white p-10 rounded-xl">
            Settings page
        </div>
    )
}

export default SettingsPage;