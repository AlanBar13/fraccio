import { createFileRoute } from "@tanstack/react-router";
import Login from "../components/Login";

export const Route = createFileRoute('/login')({
    component: LoginComp
})

function LoginComp() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Login />
        </div>
    )
}

