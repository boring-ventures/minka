
import { Search } from "lucide-react"
import { HelpAccordion } from "@/components/views/help/HelpAccordion"
import { ContactSection } from "@/components/views/help/ContactSection"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2c6e49] mb-8">¿Cómo podemos ayudarte?</h1>

          {/* Search Input */}
          <div className="relative mb-16">
            <input
              type="text"
              placeholder="Dejar consultas aquí..."
              className="w-full h-14 pl-12 pr-4 rounded-full border-2 border-[#478C5C]/20 bg-transparent focus:border-[#2c6e49] focus:ring-[#2c6e49]"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* FAQ Accordion */}
          <HelpAccordion />

          {/* Contact Section */}
          <ContactSection />
        </div>
      </main>
    </div>
  )
}

