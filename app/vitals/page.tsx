import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Navbar } from "@/components/navbar"
import { VitalSignsDashboard } from "@/components/vital-signs-dashboard"
import { VitalsHistory } from "@/components/vitals-history"
import { ClientOnly } from "@/components/client-only"
import { Activity, Heart, TrendingUp, Database } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  // Get recent vitals count
  const { count: vitalsCount } = await supabase
    .from("vitals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id)

  // Get today's vitals count
  const today = new Date().toISOString().split('T')[0]
  const { count: todayVitalsCount } = await supabase
    .from("vitals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id)
    .gte("recorded_at", `${today}T00:00:00.000Z`)
    .lt("recorded_at", `${today}T23:59:59.999Z`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
      {/* Green Globe Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] opacity-10 animate-pulse transform rotate-12 -translate-y-8">
          <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="globeGradient" cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" style={{stopColor:'#86efac', stopOpacity:0.8}}/>
                <stop offset="50%" style={{stopColor:'#22c55e', stopOpacity:0.6}}/>
                <stop offset="100%" style={{stopColor:'#15803d', stopOpacity:0.4}}/>
              </radialGradient>
              <radialGradient id="continentGradient" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" style={{stopColor:'#16a34a', stopOpacity:0.7}}/>
                <stop offset="100%" style={{stopColor:'#15803d', stopOpacity:0.5}}/>
              </radialGradient>
            </defs>
            
            {/* Main globe circle */}
            <circle cx="200" cy="200" r="180" fill="url(#globeGradient)" stroke="#22c55e" strokeWidth="2" opacity="0.7"/>
            
            {/* Continent shapes */}
            <path d="M80 150 Q120 130 160 140 Q180 120 220 130 Q250 140 280 160 Q300 180 290 220 Q270 240 240 250 Q200 260 160 250 Q120 240 100 200 Q85 175 80 150 Z" fill="url(#continentGradient)"/>
            
            <path d="M220 80 Q260 70 300 90 Q320 110 310 140 Q290 160 260 150 Q240 140 220 120 Q210 100 220 80 Z" fill="url(#continentGradient)"/>
            
            <path d="M100 280 Q140 270 180 285 Q200 300 190 320 Q170 340 140 335 Q110 330 100 310 Q95 295 100 280 Z" fill="url(#continentGradient)"/>
            
            {/* Grid lines for globe effect */}
            <g stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.3">
              {/* Latitude lines */}
              <ellipse cx="200" cy="200" rx="180" ry="60"/>
              <ellipse cx="200" cy="200" rx="180" ry="120"/>
              <ellipse cx="200" cy="200" rx="180" ry="180"/>
              
              {/* Longitude lines */}
              <ellipse cx="200" cy="200" rx="60" ry="180"/>
              <ellipse cx="200" cy="200" rx="120" ry="180"/>
              <path d="M200 20 Q240 100 200 200 Q160 300 200 380" />
              <path d="M200 20 Q160 100 200 200 Q240 300 200 380" />
            </g>
            
            {/* Highlight for 3D effect */}
            <ellipse cx="160" cy="140" rx="40" ry="30" fill="#86efac" opacity="0.4"/>
          </svg>
        </div>
      </div>

      <Navbar
        isAuthenticated={true}
        user={{
          name: profile?.name,
          email: profile?.email || data.user.email,
          avatar: profile?.avatar,
        }}
      />

      <div className="pt-20 p-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Vital Signs Monitor</h1>
                <p className="text-lg text-gray-600 mt-1">Real-time monitoring and recording of your health vitals</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">System Status: Active</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Connected Devices: 4</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Today's Records: {todayVitalsCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Total Records: {vitalsCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
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
                  <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
              }>
                <VitalsHistory />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}