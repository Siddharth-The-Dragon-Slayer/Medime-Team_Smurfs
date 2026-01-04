"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  name: string | null
  email: string | null
  phone_number: string | null
  caretaker_name: string | null
  relation: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    caretaker_name: "",
    relation: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      if (profileData) {
        setProfile(profileData)
        setFormData({
          name: profileData.name || "",
          email: profileData.email || user.email || "",
          phone_number: profileData.phone_number || "",
          caretaker_name: profileData.caretaker_name || "",
          relation: profileData.relation || "",
        })
      } else {
        const newProfile = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          email: user.email,
          phone_number: null,
          caretaker_name: null,
          relation: null,
        }

        const { data: insertedProfile, error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single()

        if (insertError) throw insertError

        setProfile(insertedProfile)
        setFormData({
          name: insertedProfile.name || "",
          email: user.email || "",
          phone_number: "",
          caretaker_name: "",
          relation: "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError(error instanceof Error ? error.message : "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: formData.name.trim() || "User",
          email: formData.email || null,
          phone_number: formData.phone_number || null,
          caretaker_name: formData.caretaker_name || null,
          relation: formData.relation || null,
        })
        .eq("id", profile.id)

      if (updateError) throw updateError

      setProfile({
        ...profile,
        name: formData.name.trim() || "User",
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        caretaker_name: formData.caretaker_name || null,
        relation: formData.relation || null,
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        caretaker_name: profile.caretaker_name || "",
        relation: profile.relation || "",
      })
    }
    setIsEditing(false)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{profile?.name || "Not provided"}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{profile?.email || "Not provided"}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{profile?.phone_number || "Not provided"}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="caretaker">Caretaker Name</Label>
                {isEditing ? (
                  <Input
                    id="caretaker"
                    value={formData.caretaker_name}
                    onChange={(e) => setFormData({ ...formData, caretaker_name: e.target.value })}
                    placeholder="Enter caretaker's name"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{profile?.caretaker_name || "Not provided"}</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="relation">Relation to Caretaker</Label>
                {isEditing ? (
                  <Input
                    id="relation"
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    placeholder="e.g., Son, Daughter, Spouse"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{profile?.relation || "Not provided"}</div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
