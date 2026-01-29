import { createServerFn } from '@tanstack/react-start'
import { getSupabaseClient } from './supabase'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(6),
})

const signupSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    tenantId: z.string(),
})

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
        const { data: profile, error: profileError } = await supabase.from('profiles').select("full_name, role").eq('id', data.user.id).single()
        if (!profile || profileError) {
            throw new Error('Profile not found')
        }

        return {
            email: data.user.email,
            tenantId: data.user.user_metadata.tenantId,
            role: profile.role,
            full_name: profile.full_name
        }
    })

export const loginFn = createServerFn({ method: 'POST' })
    .inputValidator(loginSchema)
    .handler(async ({ data }) => {
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

        if (!auth.user.user_metadata.tenantId) {
            return {
                error: true,
                message: 'User has no tenant assigned'
            }
        }

        return {
            error: false,
            message: 'User logged in',
            tenantId: auth.user.user_metadata.tenantId
        }
    })

export const signupFn = createServerFn({ method: 'POST' })
    .inputValidator(signupSchema)
    .handler(async ({ data }) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    tenantId: data.tenantId,
                    full_name: "Alan Bardales",
                    role: "user"
                }
            }
        })

        if (error) {
            return {
                error: true,
                message: error.message
            }
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