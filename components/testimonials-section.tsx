"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote, Heart, Users } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Cardiologist",
      hospital: "Mayo Clinic",
      image: "/caring-doctor.png",
      rating: 5,
      quote:
        "MediGuide has revolutionized how my patients manage their medications. The AI-powered insights help me make better treatment decisions, and the adherence rates have improved dramatically.",
      highlight: "Improved patient outcomes by 40%",
    },
    {
      name: "Michael Rodriguez",
      role: "Patient",
      condition: "Diabetes Management",
      image: "/patient-consultation.png",
      rating: 5,
      quote:
        "As someone managing multiple medications for diabetes, this app has been a lifesaver. The smart reminders and family integration mean I never miss a dose, and my A1C levels have never been better.",
      highlight: "Perfect medication adherence for 8 months",
    },
    {
      name: "Jennifer Walsh",
      role: "Caregiver",
      relationship: "Caring for elderly mother",
      image: "/caregiver.png",
      rating: 5,
      quote:
        "Taking care of my mother's complex medication regimen was overwhelming. MediGuide's care circle feature lets me monitor her medications remotely and coordinate with her doctors seamlessly.",
      highlight: "Reduced medication errors by 95%",
    },
    {
      name: "Dr. James Thompson",
      role: "Geriatrician",
      hospital: "Johns Hopkins",
      image: "/diverse-medical-team.png",
      rating: 5,
      quote:
        "The platform's ability to track medication interactions and provide real-time alerts has prevented several potentially dangerous situations. It's become an essential tool in my practice.",
      highlight: "Prevented 12 serious drug interactions",
    },
    {
      name: "Lisa Park",
      role: "Nurse Practitioner",
      department: "Oncology",
      image: "/diverse-nurses-team.png",
      rating: 5,
      quote:
        "Cancer patients have complex medication schedules. MediGuide's personalized approach and family support features have significantly improved treatment compliance and patient quality of life.",
      highlight: "98% patient satisfaction rate",
    },
    {
      name: "Robert Kim",
      role: "Patient",
      condition: "Heart Disease",
      image: "/patient-consultation.png",
      rating: 5,
      quote:
        "After my heart attack, managing 8 different medications was terrifying. The app's AI learned my routine and now I feel confident and in control of my health again.",
      highlight: "Zero missed doses in 6 months",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Users className="w-4 h-4 mr-2" />
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Trusted by Healthcare Professionals & Patients
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance leading-relaxed">
            See how MediGuide is transforming medication management across the healthcare ecosystem
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 bg-white"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-8 h-8 text-primary/30" />
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>

                {/* Highlight Badge */}
                <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20">
                  <Heart className="w-3 h-3 mr-1" />
                  {testimonial.highlight}
                </Badge>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">
                      {testimonial.hospital ||
                        testimonial.condition ||
                        testimonial.relationship ||
                        testimonial.department}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Trusted by Healthcare Leaders</h3>
            <p className="text-lg text-gray-600">Join the growing community of healthcare professionals and patients</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-gray-600">Adherence Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Healthcare Partners</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9★</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
