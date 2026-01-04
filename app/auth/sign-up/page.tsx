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
import { Heart } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    caretakerName: "",
    relation: "",
    phoneNumber: "",
    fhirId: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // User is already logged in, redirect to dashboard
        router.replace("/dashboard")
      } else {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phoneNumber,
          caretakerName: formData.caretakerName,
          relation: formData.relation,
          fhirId: formData.fhirId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Force a hard navigation and refresh
      window.location.href = "/dashboard"
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">MediMe</span>
          </div>
          <p className="text-gray-600">Join thousands managing medications with AI</p>
        </div>

        <Card className="border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">Set up your personalized medication management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirm Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={formData.repeatPassword}
                    onChange={(e) => handleInputChange("repeatPassword", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="caretaker-name">Caretaker Name (Optional)</Label>
                  <Input
                    id="caretaker-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.caretakerName}
                    onChange={(e) => handleInputChange("caretakerName", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="relation">Relation (Optional)</Label>
                  <Input
                    id="relation"
                    type="text"
                    placeholder="Spouse, Child, etc."
                    value={formData.relation}
                    onChange={(e) => handleInputChange("relation", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fhir-id">FHIR ID</Label>
                  <Input
                    id="fhir-id"
                    type="text"
                    placeholder="Your healthcare provider's FHIR ID"
                    required
                    value={formData.fhirId}
                    onChange={(e) => handleInputChange("fhirId", e.target.value)}
                    className="border-green-200 focus:border-primary"
                  />
                  <p className="text-xs text-gray-500">
                    This connects your account to your healthcare provider's system
                  </p>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
