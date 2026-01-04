"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "What is MediGuide?",
      answer:
        "MediGuide is an AI-powered medication adherence platform that helps patients manage their medications through intelligent scheduling, personalized reminders, and seamless integration with healthcare providers via FHIR standards.",
    },
    {
      question: "How does MediGuide track my medications?",
      answer:
        "MediGuide integrates with your healthcare provider's system using your FHIR ID to automatically import your medication list. Our AI then creates personalized schedules and sends smart reminders based on your lifestyle and medical needs.",
    },
    {
      question: "Can I share my medication plan with my family or caregivers?",
      answer:
        "Yes! MediGuide includes a family dashboard feature that allows you to share your medication schedule and adherence progress with designated caregivers, family members, or healthcare providers while maintaining your privacy preferences.",
    },
    {
      question: "Is my medical information safe?",
      answer:
        "Absolutely. MediGuide uses enterprise-grade security with end-to-end encryption, HIPAA compliance, and follows all healthcare data protection standards. Your medical information is never shared without your explicit consent.",
    },
    {
      question: "How do I get started with MediGuide?",
      answer:
        "Simply sign up with your basic information and FHIR ID. Our system will automatically import your medication list from your healthcare provider, and our AI will create a personalized medication schedule within minutes.",
    },
  ]

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Questions? We've got <span className="text-primary">answers</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about MediGuide and medication management.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-green-50/50 border border-green-100 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
