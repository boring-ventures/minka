import { Header } from "@/components/views/landing-page/Header";
import { CampaignGallery } from "@/components/views/campaign/CampaignGallery";
import { CampaignProgress } from "@/components/views/campaign/CampaignProgress";
import { CampaignDetails } from "@/components/views/campaign/CampaignDetails";
import { DonorComments } from "@/components/views/campaign/DonorComments";
import { CausesSection } from "@/components/views/landing-page/CausesSection";

// This would come from your API/database
const campaignData = {
  title: "Protejamos juntos el Parque Nacional Amboró",
  description:
    "El Parque Nacional Amboró es un tesoro natural incomparable, reconocido como uno de los lugares más biodiversos del planeta. En sus exuberantes paisajes, alberga especies únicas de flora y fauna que dependen de este ecosistema para sobrevivir. Sin embargo, esta riqueza está amenazada por la deforestación, la caza furtiva y otros riesgos ambientales.\n\nTu contribución será destinada a proyectos que restauren y protejan los hábitats del parque, implementen programas de vigilancia y promuevan la educación ambiental en las comunidades locales. ¡Únete a nosotros para marcar la diferencia!",
  beneficiaries:
    "Los fondos recaudados apoyarán iniciativas lideradas por organizaciones especializadas en conservación ambiental, además de beneficiar directamente a las comunidades que rodean el parque, promoviendo prácticas sostenibles y una convivencia armoniosa con la naturaleza.",
  images: [
    { url: "/amboro-campaign.jpg", type: "image" as const },
    { url: "/amboro-campaign.jpg", type: "image" as const },
    { url: "/amboro-campaign.jpg", type: "video" as const },
  ],
  progress: {
    isVerified: true,
    createdAt: "6 días",
    currentAmount: 1200,
    targetAmount: 4000,
    donorsCount: 250,
  },
  organizer: {
    name: "Andrés Martínez Saucedo",
    role: "Organizador de campaña",
    location: "Santa Cruz de la Sierra, Bolivia",
    memberSince: "2023",
    successfulCampaigns: 2,
    bio: "Soy un activista ambiental comprometido con la conservación de la biodiversidad. Trabajo con comunidades locales para promover la sostenibilidad.",
  },
  comments: [
    {
      donor: "Nadia Rosas",
      amount: 200,
      date: "3 días",
      comment:
        "Es un honor poder contribuir a la conservación del Parque Nacional Amboró. ¡Juntos podemos hacer la diferencia! Sigamos protegiendo este maravilloso lugar",
    },
    {
      donor: "Carlos Mendoza",
      amount: 150,
      date: "4 días",
      comment:
        "Excelente iniciativa para proteger nuestro patrimonio natural. Espero que más personas se unan a esta causa.",
    },
    {
      donor: "María Valencia",
      amount: 300,
      date: "5 días",
      comment:
        "Como bióloga, sé lo importante que es preservar estos ecosistemas. Gracias por liderar esta campaña.",
    },
  ],
};

export default function CampaignPage() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {campaignData.title}
          </h1>
          <p className="text-center text-gray-600 text-lg">
            El Parque Nacional Amboró es uno de los lugares más biodiversos del
            mundo, hogar de especies únicas y ecosistemas vitales. Su
            conservación depende de todos nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <CampaignGallery images={campaignData.images} />
          </div>
          <div>
            <CampaignProgress {...campaignData.progress} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <CampaignDetails
              organizer={campaignData.organizer}
              description={campaignData.description}
              beneficiaries={campaignData.beneficiaries}
            />
            <div className="mt-12">
              <DonorComments comments={campaignData.comments} />
            </div>
          </div>
        </div>

        <section className="py-16">
          <h2 className="text-4xl font-bold text-center mb-4">
            Únete a otras causas
          </h2>
          <p className="text-center text-gray-600 text-lg mb-12">
            Juntos hacemos la diferencia ¡Apoya una campaña hoy!
          </p>
          <CausesSection />
        </section>
      </main>
    </div>
  );
}
