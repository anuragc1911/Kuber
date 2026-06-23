'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export type AuthResult = { ok: true } | { ok: false; error: string }

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  error: "supabase isn't connected yet — add NEXT_PUBLIC_SUPABASE_URL to .env.local.",
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { ok: false, error: 'email and password are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { ok: false, error: error.message.toLowerCase() }

  revalidatePath('/', 'layout')
  redirect('/app')
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const businessName = String(formData.get('businessName') ?? '').trim()

  if (!email || !password) {
    return { ok: false, error: 'email and password are required.' }
  }
  if (password.length < 8) {
    return { ok: false, error: 'password must be at least 8 characters.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { business_name: businessName || null },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
    },
  })

  if (error) return { ok: false, error: error.message.toLowerCase() }

  revalidatePath('/', 'layout')
  redirect('/sign-up/check-email')
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect('/sign-in')
  }
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/sign-in')
}
