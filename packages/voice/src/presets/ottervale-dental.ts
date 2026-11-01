import type { CompanyProfile } from "../profile.ts";

/** Fictional dental clinic in the fictional town of Lindmark. The phone number is in the UK range Ofcom reserves for drama. */
export const ottervaleDental: CompanyProfile = {
  id: "ottervale-dental",
  name: "Ottervale Dental",
  fictional: true,
  industry: "Dental clinic",
  tagline: "Calm, careful dentistry in the centre of Lindmark.",
  website: "https://ottervale-dental.example",
  logo: { kind: "monogram", text: "OD" },
  colors: { brand: "#0f766e", brandForeground: "#ffffff" },
  people: {
    owner: { name: "Dr. Lena Okafor", role: "Dentist and practice owner" },
    assistantName: "Mia from Ottervale",
  },
  voice: {
    tone:
      "Warm, calm and reassuring. Short sentences. Many patients are nervous, so explain the next step plainly and never rush them. Use the patient's first name once.",
    wordsToUse: ["gentle", "take your time", "we explain each step", "check-up", "appointment"],
    wordsToAvoid: ["pain-free", "cheap", "drill", "guaranteed", "don't worry"],
    signOff: "Warm regards,\nMia from Ottervale Dental",
  },
  policies: {
    mayPromise: [
      "Offer open appointment slots from the calendar",
      "Confirm the prices listed in the services",
      "Send the new patient form by email",
      "Explain what happens during a check-up or a cleaning",
    ],
    neverPromise: [
      "A diagnosis or a treatment plan",
      "That a treatment will not hurt",
      "What a health insurer will pay",
      "Discounts or prices that are not listed",
      "Same-day appointments that are not in the calendar",
    ],
    handoverWhen: [
      "The patient complains about a treatment, a bill or a member of the team",
      "The patient asks for a refund",
      "The patient describes pain, swelling, bleeding or an accident and wants medical advice",
      "Legal questions, including requests for patient records or data",
      "Anything the company knowledge does not answer",
    ],
    handoverMessage:
      "Thank you for telling me. I have passed this to our team, and Dr. Okafor's team will reply to you personally within one working day. If you are in severe pain, please call us on +44 7700 900471.",
  },
  knowledge: {
    services: [
      { name: "Check-up and consultation", description: "Full check of teeth and gums with a short written report.", price: "EUR 65" },
      { name: "Professional teeth cleaning", description: "60 minutes with a dental hygienist, including polishing and fluoride.", price: "EUR 120" },
      { name: "Tooth-coloured filling", description: "Composite filling for one tooth.", price: "from EUR 90" },
      { name: "Teeth whitening", description: "In-practice whitening in one 90-minute visit.", price: "EUR 390" },
      { name: "Clear aligner consultation", description: "Scan, photos and a written treatment estimate.", price: "EUR 150, credited if you start treatment" },
      { name: "Children's check-up", description: "For children under 14, in a quiet room with time to look around first.", price: "EUR 40" },
    ],
    openingHours: "Monday to Thursday 8:00 to 18:00, Friday 8:00 to 14:00. Closed on weekends and public holidays.",
    location: "4 Kestrel Lane, Lindmark",
    contactEmail: "hello@ottervale-dental.example",
    phone: "+44 7700 900471",
    faq: [
      {
        question: "Do you take new patients?",
        answer: "Yes, adults and children. Book a check-up and fill in the new patient form we email you.",
      },
      {
        question: "Do you accept public health insurance?",
        answer:
          "We treat patients with public and private insurance. Your insurer decides what it pays; we give you a written cost estimate before any treatment it does not fully cover.",
      },
      {
        question: "What should I bring to my first visit?",
        answer: "Your insurance card, a list of the medicines you take and any X-rays from the last two years.",
      },
      {
        question: "I am nervous about the dentist. Can you help?",
        answer:
          "Tell us when you book. We plan extra time, explain each step before we start, and you can ask for a pause at any moment.",
      },
      {
        question: "How do I cancel or move an appointment?",
        answer: "Reply to your confirmation email or call us at least 24 hours before. Later cancellations cost EUR 30.",
      },
      {
        question: "Do you have appointments for acute pain?",
        answer: "We keep two short slots free each weekday morning for acute pain. Call us from 8:00.",
      },
      {
        question: "How do I get there?",
        answer: "Lindmark Central station is a 5-minute walk away. There is street parking on Kestrel Lane.",
      },
    ],
    bookingMinutes: 30,
  },
};
