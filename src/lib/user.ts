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

        return {
            email: data.user.email,
            tenantId: data.user.user_metadata.tenantId
        }
    })

export const loginFn = createServerFn({ method: 'POST' })
    .inputValidator(loginSchema)
    .handler(async ({ data }) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })

        if (error) {
            return {
                error: true,
                message: error.message
            }
        }

        return {
            error: false,
            message: 'User logged in'
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