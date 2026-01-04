"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Heart, Shield, Clock, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full animate-pulse-green"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-slide-up">
          <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Heart className="w-4 h-4 mr-2" />
            AI-Powered Healthcare
          </Badge>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
            <span className="text-primary">AI-Powered</span> <span className="text-gray-900">Medication</span>
            <br />
            <span className="text-gray-900">Guidance &</span> <span className="text-primary italic">Adherence</span>
          </h1>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-xl md:text-2xl text-gray-600 text-balance mb-8 max-w-4xl mx-auto leading-relaxed">
            Predictive personalization, smart reminders, and care circle integration. Transform medication management
            with intelligent AI assistance and seamless healthcare coordination.
          </p>
        </div>

        <div
          className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center mb-12"
          style={{ animationDelay: "0.6s" }}
        >
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
            <Link href="/auth/sign-up">
              <Heart className="w-5 h-5 mr-2" />
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary/5 bg-transparent"
          >
            <Link href="#features">
              <Shield className="w-5 h-5 mr-2" />
              Learn More
            </Link>
          </Button>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.8s" }}>
          <p className="text-sm text-gray-500 mb-8">Trusted by leading healthcare institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-gray-600 font-medium">Mayo Clinic</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-gray-600 font-medium">Johns Hopkins</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-gray-600 font-medium">Cleveland Clinic</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-gray-600 font-medium">Kaiser Permanente</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
