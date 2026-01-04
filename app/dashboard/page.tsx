import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Navbar } from "@/components/navbar"
import { MedicationDashboard } from "@/components/medication-dashboard"
import { VitalsCardsOnly } from "@/components/vitals-cards-only"

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
      {/* Green Globe Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] opacity-15 animate-pulse transform rotate-12 -translate-y-8">
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

      <Navbar />

      <div className="pt-16 p-6 space-y-8 relative z-10">
        <MedicationDashboard user={data.user} profile={profile} />
      </div>
    </div>
  )
}
