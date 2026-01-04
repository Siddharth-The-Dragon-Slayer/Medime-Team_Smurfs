"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Bell, Users, Shield, Smartphone, BarChart3, Heart, Clock, CheckCircle, Zap, Target } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Personalization",
      description:
        "Advanced machine learning algorithms analyze your health data, medication history, and lifestyle patterns to provide personalized medication guidance and optimize your treatment plan.",
      badge: "Smart AI",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Bell,
      title: "Smart Reminders & Alerts",
      description:
        "Intelligent notification system that learns your routine and sends timely reminders via multiple channels - SMS, email, push notifications, and smart device integration.",
      badge: "Automated",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Users,
      title: "Care Circle Integration",
      description:
        "Connect with family members, caregivers, and healthcare providers. Share medication progress, receive support, and ensure coordinated care across your entire healthcare team.",
      badge: "Connected",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Shield,
      title: "HIPAA-Compliant Security",
      description:
        "Enterprise-grade security with end-to-end encryption, secure data storage, and full HIPAA compliance to protect your sensitive health information.",
      badge: "Secure",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Smartphone,
      title: "Multi-Platform Access",
      description:
        "Access your medication information anywhere with our responsive web app, native mobile apps, and smart device integrations including Apple Watch and Google Assistant.",
      badge: "Universal",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Comprehensive dashboards and reports showing medication adherence trends, health outcomes, and personalized insights to help you and your doctor make informed decisions.",
      badge: "Insights",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const benefits = [
    {
      icon: CheckCircle,
      title: "98% Adherence Rate",
      description: "Users achieve industry-leading medication adherence rates",
    },
    {
      icon: Heart,
      title: "Better Health Outcomes",
      description: "Improved treatment effectiveness and reduced complications",
    },
    {
      icon: Clock,
      title: "Time Savings",
      description: "Reduce medication management time by up to 75%",
    },
    {
      icon: Target,
      title: "Precision Medicine",
      description: "Personalized recommendations based on your unique profile",
    },
  ]

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Zap className="w-4 h-4 mr-2" />
            Advanced Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Intelligent Medication Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance leading-relaxed">
            Our AI-powered platform combines cutting-edge technology with healthcare expertise to revolutionize how you
            manage your medications and health outcomes.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Proven Results & Benefits</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who have transformed their medication management experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              <Heart className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
