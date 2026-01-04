"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle, Heart } from "lucide-react"

export function FAQSection() {
  const faqs = [
    {
      question: "How does the AI personalization work?",
      answer:
        "Our AI analyzes your medication history, health conditions, lifestyle patterns, and adherence data to create a personalized medication management plan. It learns from your behavior and continuously optimizes reminders, timing, and recommendations to fit your unique needs and schedule.",
    },
    {
      question: "Is my health data secure and private?",
      answer:
        "Absolutely. We use enterprise-grade security with end-to-end encryption, secure cloud storage, and full HIPAA compliance. Your data is never shared without your explicit consent, and we follow the strictest healthcare privacy standards. All data is encrypted both in transit and at rest.",
    },
    {
      question: "Can my family and caregivers access my information?",
      answer:
        "Yes, through our Care Circle feature, you can invite family members, caregivers, and healthcare providers to access specific information you choose to share. You maintain full control over what information is shared and can revoke access at any time.",
    },
    {
      question: "What types of medications can I track?",
      answer:
        "You can track all types of medications including prescription drugs, over-the-counter medications, vitamins, supplements, and even medical devices like inhalers. The system handles complex schedules, multiple doses, and can track liquid medications, patches, and injections.",
    },
    {
      question: "How do the smart reminders work?",
      answer:
        "Our intelligent reminder system learns your daily routine and sends notifications through your preferred channels (SMS, email, push notifications, smart devices). It adapts to your schedule, accounts for time zones when traveling, and can escalate to emergency contacts if doses are missed.",
    },
    {
      question: "Can I integrate with my doctor's system?",
      answer:
        "Yes, we integrate with major Electronic Health Record (EHR) systems and can share medication adherence data with your healthcare providers. This helps your doctor make informed decisions about your treatment and monitor your progress between visits.",
    },
    {
      question: "What if I miss a dose?",
      answer:
        "The app provides immediate guidance based on your specific medication and timing. It can tell you whether to take the missed dose, skip it, or contact your healthcare provider. For critical medications, it can alert your care circle and provide emergency contact information.",
    },
    {
      question: "Is there a cost to use MediGuide?",
      answer:
        "We offer a free basic plan with essential medication tracking and reminders. Premium plans include advanced AI features, care circle integration, detailed analytics, and healthcare provider integration. We also work with insurance companies and healthcare systems to provide coverage.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply sign up for a free account, add your medications using our easy setup wizard, and invite your care circle. The AI will start learning your patterns immediately, and you'll begin receiving personalized recommendations within the first week of use.",
    },
    {
      question: "What devices and platforms are supported?",
      answer:
        "MediGuide works on all major platforms including iOS, Android, web browsers, Apple Watch, and integrates with smart home devices like Alexa and Google Assistant. Your data syncs seamlessly across all devices so you're never without access to your medication information.",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-balance leading-relaxed">
            Get answers to common questions about MediGuide's features, security, and how it can help you manage your
            medications better.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-gray-200 rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-primary py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact Support */}
        <div className="mt-16 text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our healthcare support team is available 24/7 to help you with any questions about medication management,
            technical issues, or getting the most out of MediGuide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Heart className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/5 bg-transparent"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
