"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain, Calendar, Heart, Shield, Clock, Pill, Activity } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Intelligent Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered tools designed to revolutionize medication management and improve patient outcomes
            through personalized care.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Predictive Personalization */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Predictive Personalization Engine</h3>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">
              AI-powered analysis of patient data to create personalized medication schedules and dosage
              recommendations.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-green-50 border-green-200">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="font-medium text-gray-900">Vitals</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Schedule</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4 bg-purple-50 border-purple-200">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">History</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4 bg-orange-50 border-orange-200">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Pill className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Allergies</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4 bg-red-50 border-red-200">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Pill className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Dosage</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4 bg-green-50 border-green-200">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium text-gray-900">Safety</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Right side - Smart Medication Scheduler */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Smart Medication Scheduler</h3>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">
              Intelligent scheduling system that adapts to your lifestyle and sends timely reminders for optimal
              medication adherence.
            </p>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <h4 className="text-4xl font-bold text-primary mb-2">MedSchedule</h4>
                  <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center animate-pulse-green">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary/40 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">Morning</span>
                    </div>
                    <p className="text-gray-600">8:00 AM - Metformin</p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">Afternoon</span>
                    </div>
                    <p className="text-gray-600">2:00 PM - Lisinopril</p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">Evening</span>
                    </div>
                    <p className="text-gray-600">7:00 PM - Atorvastatin</p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">Night</span>
                    </div>
                    <p className="text-gray-600">10:00 PM - Melatonin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
