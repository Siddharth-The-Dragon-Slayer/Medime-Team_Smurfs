import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Navbar } from "@/components/navbar"
import { MedicationDashboard } from "@/components/medication-dashboard"
import { VitalSignsDashboard } from "@/components/vital-signs-dashboard"

async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navbar
        isAuthenticated={true}
        user={{
          name: profile?.name,
          email: profile?.email || data.user.email,
          avatar: profile?.avatar,
        }}
      />

      <div className="pt-16 p-6 space-y-8">
        <VitalSignsDashboard />
        <MedicationDashboard user={data.user} profile={profile} />
      </div>
    </div>
  )
}
