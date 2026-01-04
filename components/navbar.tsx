"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Menu, X, Calendar, Bell, MessageCircle, LayoutDashboard, LogOut, User, Activity, Stethoscope } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createBrowserClient } from "@supabase/ssr"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()

  const isLandingPage = pathname === "/"

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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsAuthenticated(!!user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const navigationItems = isAuthenticated
    ? [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/vitals", label: "Vitals", icon: Activity },
      { href: "/scheduler", label: "Scheduler", icon: Calendar },
      { href: "/reminders", label: "Reminders", icon: Bell },
      { href: "/chat", label: "AI Chat", icon: MessageCircle },
    ]
    : []

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">MediMe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - Auth or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                          alt={user?.user_metadata?.full_name}
                        />
                        <AvatarFallback>
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
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
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-primary transition-colors">
                  Log In
                </Link>
                <Link href="/auth/doctor-login" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctor Login</span>
                </Link>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
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
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-gray-600">Notifications</span>
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-gray-200">
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-gray-600 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/doctor-login"
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor Login</span>
                  </Link>
                  <div className="px-3 py-2">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href="/auth/sign-up">Sign Up</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
