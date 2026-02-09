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
import { useEffect, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { signupFn } from "@/lib/user"
import { useRouter } from "@tanstack/react-router"
import { Database } from "@/database.types"
import { useToast } from "./notifications"
import { removeInviteFn } from "@/lib/invites"

interface Props {
    invite: Database['public']['Tables']['invites']['Row']
}

export default function Signup({ invite }: Props) {
    const { addToast } = useToast()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const signupWithTenant = useServerFn(signupFn)
    const removeInvite = useServerFn(removeInviteFn)

    useEffect(() => {
        setEmail(invite.email)
        setName(invite.name)
    }, [invite])

    const handleSignup = async () => {
        try {
            if (password !== confirmPassword) {
                addToast({
                    type: 'warning',
                    description: 'Las contraseñas no coinciden',
                    duration: 10000
                })
                return
            }
            setLoading(true)
            const { error } = await signupWithTenant({
                data: { email, password, name, tenantId: invite.tenant_id, inviteId: invite.id }
            })
            if (error) {
                console.log(error)
                addToast({
                    type: 'error',
                    description: `Error al registrarse`,
                    duration: 10000
                })
                return
            }
            await removeInvite({ data: { token: invite.id } })
            router.navigate({ to: '/login' })
        } catch (error) {
            console.error('Signup error:', error)
            addToast({
                type: 'error',
                description: `Error al registrarse'}`,
                duration: 10000
            })
        }
        finally {
            setLoading(false)
        }
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
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Nombre completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@ejemplo.com"
                                disabled
                                value={email}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input id="confirmPassword" type="password" required onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => handleSignup()} disabled={loading}>
                    {loading ? 'Registrándose...' : 'Registrarse'}
                </Button>
            </CardFooter>
        </Card>
    )
}
