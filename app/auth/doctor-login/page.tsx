"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Stethoscope, Eye, EyeOff } from "lucide-react"

export default function DoctorLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user is a doctor
        const { data: doctor } = await supabase
          .from('doctors')
          .select('*')
          .eq('auth_id', user.id)
          .single()

        if (doctor) {
          router.replace("/doctor/dashboard")
        } else {
          router.replace("/dashboard")
        }
      } else {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Hardcoded doctor credentials
      const validDoctorCredentials = {
        email: "doctor@test.com",
        password: "password123"
      }

      // Check hardcoded credentials
      if (formData.email === validDoctorCredentials.email && 
          formData.password === validDoctorCredentials.password) {
        
        // Create a mock doctor session in localStorage for the dashboard
        const mockDoctor = {
          id: "doctor-123",
          name: "Dr. Test Doctor",
          email: "doctor@test.com",
          specialization: "General Practice",
          hospital_affiliation: "Test Hospital",
          license_number: "MD123456",
          phone: "+1234567890"
        }
        
        localStorage.setItem('mockDoctor', JSON.stringify(mockDoctor))
        localStorage.setItem('isDoctorLoggedIn', 'true')
        
        // Redirect to doctor dashboard
        router.push("/doctor/dashboard")
        return
      }

      // If not hardcoded credentials, show error
      throw new Error('Invalid doctor credentials. Use: doctor@test.com / password123')

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">MediMe</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor Portal</h1>
          <p className="text-gray-600">Access your patient management dashboard</p>
        </div>

        <Card className="border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Doctor Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to access patient vitals and medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm font-medium">Demo Credentials:</p>
              <p className="text-blue-700 text-sm">Email: doctor@test.com</p>
              <p className="text-blue-700 text-sm">Password: password123</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-blue-200 focus:border-blue-600"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="border-blue-200 focus:border-blue-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm space-y-2">
                <p className="text-gray-600">
                  Not a doctor?{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                    Patient Login
                  </Link>
                </p>
                <p className="text-gray-600">
                  Need a doctor account?{" "}
                  <Link href="/auth/doctor-signup" className="text-blue-600 hover:underline font-medium">
                    Register Here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}