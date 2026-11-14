import { useSeo } from "@/hooks/use-seo";
import Navbar from "@/components/sections/Navbar";
import CitySuggestion from "@/components/CitySuggestion";
import HeroClassic from "@/components/sections/HeroClassic";
import Services from "@/components/sections/Services";
import ServiceZones from "@/components/sections/ServiceZones";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import WhatsAppButton from "@/components/sections/WhatsAppButton";
import MobileActionFooter from "@/components/sections/MobileActionFooter";
import Reviews from "@/components/sections/Reviews";

export default function Home() {
  useSeo({
    title: "Lavado de Tinacos y Cisternas en Querétaro y México | MonsterCo",
    description:
      "Lavado y desinfección profesional de tinacos y cisternas con hidrolavadora. Precios fijos, cero anticipos y pago contra entrega en Querétaro y 12 ciudades de México.",
    path: "/",
  });

  return (
    <div className="min-h-screen bg-background font-sans pb-16 md:pb-0">
      <Navbar />
      <CitySuggestion currentCity="queretaro" />
      <main>
        <HeroClassic />
        <Reviews />
        <Services />
        <ServiceZones />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileActionFooter />
    </div>
  );
}
