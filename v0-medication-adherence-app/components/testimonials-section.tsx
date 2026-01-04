"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Cardiologist",
      handle: "@dr_sarahchen",
      content:
        "This AI medication platform has transformed how I manage my patients' adherence. The predictive insights are incredibly accurate.",
      avatar: "/caring-doctor.png",
    },
    {
      name: "Nurse Lisa Williams",
      role: "Registered Nurse",
      handle: "@nurse_lisa",
      content:
        "The family dashboard feature is game-changing. My elderly patients' families can now stay connected and informed about medication schedules.",
      avatar: "/diverse-nurses-team.png",
    },
    {
      name: "Robert Kim",
      role: "Patient",
      handle: "@robert_patient",
      content:
        "After my heart surgery, this app helped me stay on track with 8 different medications. Couldn't have done it without the AI guidance.",
      avatar: "/patient-consultation.png",
    },
    {
      name: "Carlos Mendez",
      role: "Family Caregiver",
      handle: "@carlos_health",
      content:
        "My wife and I both use this for our chronic conditions. The family dashboard keeps us both accountable and connected.",
      avatar: "/caregiver.png",
    },
    {
      name: "Dr. Michael Thompson",
      role: "Family Medicine",
      handle: "@dr_mthompson",
      content:
        "The FHIR integration seamlessly connects with our EHR system. Patient medication compliance has improved by 40% since implementation.",
      avatar: "/diverse-medical-team.png",
    },
  ]

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Healthcare Professionals &<br />
            <span className="text-primary">Patients Love Us</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From doctors to patients, our AI-powered medication management has become an essential healthcare tool.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>

                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.handle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
