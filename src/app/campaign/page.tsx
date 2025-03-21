import { CampaignGallery } from "@/components/views/campaign/CampaignGallery";
import { CampaignProgress } from "@/components/views/campaign/CampaignProgress";
import { StickyProgressWrapper } from "@/components/views/campaign/StickyProgressWrapper";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for related campaigns
const relatedCampaigns = [
  {
    id: 1,
    title: "Educación para niños en zonas rurales",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Educación",
    location: "La Paz, Bolivia",
    progress: 65,
    description:
      "Ayúdanos a llevar educación de calidad a niños en zonas rurales de Bolivia que no tienen acceso a escuelas o materiales educativos adecuados.",
    donorCount: 180,
    amountRaised: "Bs. 950,00",
  },
  {
    id: 2,
    title: "Apoyo a artesanos locales",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Cultura y arte",
    location: "Cochabamba, Bolivia",
    progress: 45,
    description:
      "Contribuye a preservar las tradiciones artesanales bolivianas y apoya a familias que dependen de este oficio para su sustento diario.",
    donorCount: 120,
    amountRaised: "Bs. 750,00",
  },
  {
    id: 3,
    title: "Centro de salud para comunidad indígena",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Salud",
    location: "Beni, Bolivia",
    progress: 90,
    description:
      "Ayuda a construir un centro de salud que brindará atención médica básica a comunidades indígenas que actualmente deben recorrer largas distancias para recibir atención.",
    donorCount: 250,
    amountRaised: "Bs. 1.800,00",
  },
];

// Define comment type
interface DonorComment {
  donor: string;
  amount: number;
  date: string;
  comment: string;
}

// This would come from your API/database
const campaignData = {
  title: "Protejamos juntos el Parque Nacional Amboró",
  description:
    "El Parque Nacional Amboró es un tesoro natural incomparable, reconocido como uno de los lugares más biodiversos del planeta. En sus exuberantes paisajes, alberga especies únicas de flora y fauna que dependen de este ecosistema para sobrevivir. Sin embargo, esta riqueza está amenazada por la deforestación, la caza furtiva y otros riesgos ambientales.\n\nTu contribución será destinada a proyectos que restauren y protejan los hábitats del parque, implementen programas de vigilancia y promuevan la educación ambiental en las comunidades locales. ¡Únete a nosotros para marcar la diferencia!",
  beneficiaries:
    "Los fondos recaudados apoyarán iniciativas lideradas por organizaciones especializadas en conservación ambiental, además de beneficiar directamente a las comunidades que rodean el parque, promoviendo prácticas sostenibles y una convivencia armoniosa con la naturaleza.",
  images: [
    { url: "/campaign/amboro-main.jpg", type: "image" as const, id: "img-1" },
    {
      url: "/campaign/amboro-secondary.jpg",
      type: "image" as const,
      id: "img-2",
    },
    { url: "/campaign/amboro-video.jpg", type: "video" as const, id: "vid-1" },
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

// Custom CampaignDetails component for this page
function CustomCampaignDetails({
  organizer,
  description,
  beneficiaries,
}: {
  organizer: {
    name: string;
    role: string;
    location: string;
    memberSince: string;
    successfulCampaigns: number;
    bio: string;
  };
  description: string;
  beneficiaries: string;
}) {
  return (
    <div className="space-y-8">
      {/* Organizer Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
          <span className="text-sm font-medium text-[#2c6e49]">
            {organizer.name[0]}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-[#2c6e49]">{organizer.name}</h3>
          <p className="text-sm text-gray-600">
            {organizer.role} | {organizer.location}
          </p>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image
            src="/landing-page/step-2.png"
            alt="Verified"
            width={32}
            height={32}
            className="text-[#2c6e49]"
          />
          <span className="text-[#2c6e49] text-xl font-medium">
            Campaña verificada por Minka
          </span>
        </div>
        <Link href="#" className="text-[#2c6e49] underline text-base">
          Más información sobre la verificación
        </Link>
      </div>

      {/* Campaign Description */}
      <div className="space-y-4 pb-8 border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
          Descripción de la campaña
        </h2>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>

      {/* Beneficiaries */}
      <div className="space-y-4 pb-8 border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
          Beneficiarios
        </h2>
        <p className="text-gray-700 leading-relaxed">{beneficiaries}</p>
      </div>

      {/* About Organizer */}
      <div className="space-y-6 pb-8 border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
          Sobre el organizador
        </h2>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
            <span className="text-sm font-medium text-[#2c6e49]">
              {organizer.name[0]}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-[#2c6e49]">{organizer.name}</h3>
            <p className="text-sm text-gray-600">
              Gestor de campaña | {organizer.location}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#2c6e49]" />
            <span className="text-lg font-medium text-[#2c6e49]">
              Tiempo en la plataforma
            </span>
          </div>
          <p className="pl-6 text-lg">Miembro desde {organizer.memberSince}</p>

          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#2c6e49]" />
            <span className="text-lg font-medium text-[#2c6e49]">
              Otras campañas
            </span>
          </div>
          <p className="pl-6 text-lg">
            {organizer.successfulCampaigns} campañas exitosas
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-xl text-[#2c6e49]">Biografía</h4>
          <p className="text-black">{organizer.bio}</p>
        </div>
      </div>
    </div>
  );
}

// Custom DonorComments component for this page
function CustomDonorComments({ comments }: { comments: DonorComment[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
        Palabras de apoyo de donadores
      </h2>
      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={`${comment.donor}-${comment.date}-${comment.amount}`}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                  <span className="text-sm font-medium text-[#2c6e49]">
                    {comment.donor[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{comment.donor}</h4>
                  <p className="text-sm text-gray-600">Hace {comment.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Donación</p>
                <p className="font-medium">Bs. {comment.amount}</p>
              </div>
            </div>
            <p className="text-black">{comment.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CampaignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Campaign Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#333333] mb-6">
            {campaignData.title}
          </h1>
          <p className="text-xl md:text-2xl text-[#555555] max-w-3xl mx-auto">
            El Parque Nacional Amboró es uno de los lugares más biodiversos del
            mundo, hogar de especies únicas y ecosistemas vitales. Su
            conservación depende de todos nosotros.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column - Gallery */}
          <div className="lg:col-span-2">
            <CampaignGallery images={campaignData.images} />
          </div>

          {/* Right Column - Progress and Donation */}
          <div>
            <StickyProgressWrapper>
              <CampaignProgress
                isVerified={campaignData.progress.isVerified}
                createdAt={campaignData.progress.createdAt}
                currentAmount={campaignData.progress.currentAmount}
                targetAmount={campaignData.progress.targetAmount}
                donorsCount={campaignData.progress.donorsCount}
                campaignTitle={campaignData.title}
                campaignOrganizer={campaignData.organizer.name}
                campaignLocation={campaignData.organizer.location}
              />
            </StickyProgressWrapper>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <CustomCampaignDetails
              organizer={campaignData.organizer}
              description={campaignData.description}
              beneficiaries={campaignData.beneficiaries}
            />
            <div className="mt-12">
              <CustomDonorComments comments={campaignData.comments} />
            </div>
          </div>
        </div>

        {/* Related Campaigns */}
        <section className="mt-24" id="related-campaigns">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-[#333333] mb-6">
              Únete a otras causas
            </h2>
            <p className="text-xl md:text-2xl text-[#555555] max-w-3xl mx-auto">
              Juntos hacemos la diferencia. ¡Apoya una campaña hoy!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {relatedCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                title={campaign.title}
                image={campaign.image}
                category={campaign.category}
                location={campaign.location}
                progress={campaign.progress}
                verified={true}
                description={campaign.description}
                donorCount={campaign.donorCount}
                amountRaised={campaign.amountRaised}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Link href="/campaigns">
              <Button
                className="bg-[#2c6e49] text-white hover:bg-[#1e4d33] hover:text-white text-xl shadow-none border-0 rounded-full"
                size="lg"
              >
                Ver más campañas <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
