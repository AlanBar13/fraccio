import { createFileRoute } from "@tanstack/react-router";
import Login from "../components/Login";

export const Route = createFileRoute('/login')({
    component: LoginComp,
    head: () => ({
        meta: [
            {
                title: 'Iniciar Sesión | Fraccio'
            }
        ]
    })
})

function LoginComp() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
            <Login />
        </div>
    )
}

