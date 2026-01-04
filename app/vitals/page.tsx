import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Navbar } from "@/components/navbar"
import { VitalSignsDashboard } from "@/components/vital-signs-dashboard"
import { VitalsSimulatorSimple } from "@/components/vitals-simulator-simple"
import { ClientOnly } from "@/components/client-only"
import { Activity } from "lucide-react"

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

export default async function VitalsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar
        isAuthenticated={true}
        user={{
          name: profile?.name,
          email: profile?.email || data.user.email,
          avatar: profile?.avatar,
        }}
      />

      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Vital Signs Monitor</h1>
                <p className="text-lg text-gray-600 mt-1">Real-time monitoring of your health vitals</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">System Status: Active</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Connected Devices: 4</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Data Quality: Excellent</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <ClientOnly fallback={
                <div className="animate-pulse">
                  <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
              }>
                <VitalSignsDashboard />
              </ClientOnly>
            </div>
            <div className="xl:col-span-1">
              <ClientOnly fallback={
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              }>
                <VitalsSimulatorSimple />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}