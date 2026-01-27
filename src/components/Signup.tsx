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
import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { signupFn } from "@/lib/user"
import { useRouter } from "@tanstack/react-router"

export default function Signup() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [tenantId, _] = useState('7cc39891-9b06-436e-b56c-0a641db7a493')

    const signupWithTenant = useServerFn(signupFn)

    const handleSignup = async () => {
        const { error } = await signupWithTenant({ data: { email, password, tenantId } })
        if (error) {
            console.log(error)
            return
        }
        router.navigate({ to: '/' })
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Registrarse</CardTitle>
                <CardDescription className="text-center">
                    Crea una cuenta para acceder a Fraccio
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
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => handleSignup()}>Registrarse</Button>
            </CardFooter>
        </Card>
    )
}
