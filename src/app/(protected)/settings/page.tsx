import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
const SettingsPage = async () => {
    const session = await auth();

    return (
        <div>
            {JSON.stringify(session)}
            <LogoutButton>
                Sair
            </LogoutButton>
        </div>
    )
}

export default SettingsPage;