import { createServerFn } from '@tanstack/react-start'
import { getSupabaseClient } from './supabase'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(6),
})

const signupSchema = z.object({
    email: z.email(),
    name: z.string(),
    password: z.string().min(6),
    tenantId: z.uuid(),
    inviteId: z.uuid()
})

const inviteUserSchema = z.object({ 
    email: z.email(), 
    tenantId: z.uuid(), 
    house_id: z.number(), 
    house_owner: z.boolean(), 
    name: z.string() 
})

interface LoginData {
    error: boolean
    message: string
    tenantId?: string | null
    role?: string
}

export const getUser = createServerFn({ method: 'GET' })
    .handler(async () => {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getUser()
        if (error) {
            throw error
        }

        if (!data.user) {
            throw new Error('User not found')
        }
        const { data: profile, error: profileError } = await supabase.from('profiles').select("full_name, role, tenant_id").eq('id', data.user.id).single()
        if (!profile || profileError) {
            throw new Error('Profile not found')
        }

        return {
            email: data.user.email,
            tenantId: profile.tenant_id,
            role: profile.role,
            full_name: profile.full_name
        }
    })

export const loginFn = createServerFn({ method: 'POST' })
    .inputValidator(loginSchema)
    .handler(async ({ data }): Promise<LoginData> => {
        const supabase = getSupabaseClient()
        const { data: auth, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })

        if (error) {
            return {
                error: true,
                message: error.message
            }
        }

        if (!auth.user) {
            return {
                error: true,
                message: 'User not found'
            }
        }

        const { data: profile, error: profileError } = await supabase.from('profiles').select("role, tenant_id").eq('id', auth.user.id).single()
        if (!profile || profileError) {
            return {
                error: true,
                message: 'Profile not found'
            }
        }


        return {
            error: false,
            message: 'User logged in',
            tenantId: profile.tenant_id || null,
            role: profile.role
        }
    })

export const signupFn = createServerFn({ method: 'POST' })
    .inputValidator(signupSchema)
    .handler(async ({ data }) => {
        const supabase = getSupabaseClient()
        
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error
        }

        const { error: signupError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    tenant_id: data.tenantId,
                    full_name: data.name,
                    role: "user"
                }
            }
        })

        if (signupError) {
            return {
                error: true,
                message: signupError.message
            }
        }

        const { error: deleteInviteError } = await supabase.from('invites').delete().eq('id', data.inviteId)
        if (deleteInviteError) {
            console.error('Error deleting invite:', deleteInviteError)
        }

        return {
            error: false,
            message: 'User signed up'
        }
    })

export const logoutFn = createServerFn({ method: 'POST' })
    .handler(async () => {
        const supabase = await getSupabaseClient()
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error
        }
        
        return { error: false, message: 'User logged out' }
    })

export const inviteUserFn = createServerFn({ method: 'POST' })
    .inputValidator(inviteUserSchema)
    .handler(async ({ data }) => {
        const supabase = getSupabaseClient()

        const { data: existingInvite } = await supabase
            .from('invites')
            .select()
            .eq('email', data.email)
            .eq('tenant_id', data.tenantId)
            .single()

        if (existingInvite) {
            return { error: true, message: 'User already invited' }
        }

        const { data: inviteData, error } = await supabase
            .from('invites')
            .insert({
                email: data.email,
                tenant_id: data.tenantId,
                house_id: data.house_id,
                house_owner: data.house_owner,
                name: data.name,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expires in 7 days
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        // send email to user with invite link (${DOMAIN}/accept-invite?token=${inviteData.id})
        return { error: false, message: 'User invited', data: inviteData }
    })