import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useState } from "react"
import { loginFn } from "@/lib/user"

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const login = useServerFn(loginFn)

    const handleLogin = async () => {
        const { error } = await login({ data: { email, password } })
        if (error) {
            console.log(error)
            return
        }
        router.navigate({ to: '/' })
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
                <CardDescription className="text-center">
                    Usa tu correo electrónico y contraseña para iniciar sesión
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@ejemplo.com"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Contraseña</Label>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <div className="flex flex-col gap-2 w-full">
                    <Button className="w-full" onClick={() => handleLogin()}>Iniciar sesión</Button>
                </div>
            </CardFooter>
        </Card>
    )
}