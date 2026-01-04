"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Stethoscope, Menu, X, Users, Activity, Calendar, LogOut, User, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  hospital_affiliation: string
}

interface DoctorNavbarProps {
  doctor: Doctor
}

export function DoctorNavbar({ doctor }: DoctorNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigationItems = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: Activity },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/doctor-login")
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/doctor/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-600">MediMe</span>
              <span className="text-xs text-gray-500">Doctor Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={doctor.name}
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">Dr. {doctor.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{doctor.email}</p>
                  <p className="text-xs leading-none text-blue-600">{doctor.specialization}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/doctor/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-gray-600">Notifications</span>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
                </div>
              </div>

              <div className="px-3 py-2 border-t border-gray-200">
                <p className="text-sm font-medium">Dr. {doctor.name}</p>
                <p className="text-xs text-muted-foreground">{doctor.email}</p>
                <p className="text-xs text-blue-600">{doctor.specialization}</p>
              </div>

              <Link
                href="/doctor/profile"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}