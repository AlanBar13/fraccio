import { getCookies, setCookie } from '@tanstack/react-start/server'
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export function getSupabaseClient() {
    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return Object.entries(getCookies()).map(([name, value]) => ({ name, value }))
                },
                setAll(cookies) {
                    cookies.forEach(cookie => {
                        setCookie(cookie.name, cookie.value)
                    })
                }
            }
        }
    )
}