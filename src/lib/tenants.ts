import { createServerFn } from '@tanstack/react-start'
import { getSupabaseClient } from './supabase'
import { z } from 'zod'

export const getTenantFn = createServerFn({ method: 'GET' })
    .inputValidator(z.object({ path: z.string() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseClient()
        const { data: tenant, error } = await supabase.from('tenants').select('*').eq('path', data.path).single()
        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw error
        }
        if (!tenant) {
            throw new Error('Tenant not found')
        }

        return tenant
    })

export const getTenantByIdFn = createServerFn({ method: 'GET' })
    .inputValidator(z.object({ id: z.string() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseClient()
        const { data: tenant, error } = await supabase.from('tenants').select('*').eq('id', data.id).single()
        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw error
        }
        if (!tenant) {
            throw new Error('Tenant not found')
        }

        return tenant
    })