import { FoundersCarousel } from "@/components/views/about-us/FounderCarousel";
import { ContactForm } from "@/components/views/about-us/ContactForm";
import { SuccessStory } from "@/components/views/about-us/SuccessStory";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8">
            Impulsamos causas, transformamos vidas
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            En Minka, creemos en el poder de la solidaridad para transformar
            vidas. Somos una plataforma de crowdfunding que conecta a quienes
            necesitan apoyo social con personas dispuestas a ayudar,
            garantizando transparencia y seguridad en cada donación. Nuestro
            objetivo es brindar un espacio accesible y confiable donde cualquier
            causa, desde emergencias hasta proyectos de impacto social, pueda
            recibir el respaldo que merece.
          </p>
        </div>

        {/* Founders Section */}
        <section className="mb-32">
          <FoundersCarousel />
        </section>

        {/* Contact Form Section */}
        <section className="mb-32">
          <ContactForm />
        </section>

        {/* Success Story Section */}
        <section className="mb-32">
          <SuccessStory />
        </section>
      </main>
      <Footer />
    </div>
  );
}
