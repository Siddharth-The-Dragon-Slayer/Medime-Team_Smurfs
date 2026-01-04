import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MedicationDashboard } from "@/components/medication-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return <MedicationDashboard user={data.user} profile={profile} />
}
