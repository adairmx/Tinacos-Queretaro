import { useEffect, useState } from "react";
import { useSeo } from "@/hooks/use-seo";
import { getHomeVariant, startHomeTracking } from "@/lib/experiment";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import HeroClassic from "@/components/sections/HeroClassic";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import ServiceZones from "@/components/sections/ServiceZones";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import WhatsAppButton from "@/components/sections/WhatsAppButton";
import MobileActionFooter from "@/components/sections/MobileActionFooter";
import Reviews from "@/components/sections/Reviews";

export default function Home() {
  const [variant] = useState(getHomeVariant);

  useEffect(() => startHomeTracking(), []);

  useSeo({
    title: "Lavado de Tinacos y Cisternas en Querétaro y México | MonsterCo",
    description:
      "Lavado y desinfección profesional de tinacos y cisternas con hidrolavadora. Precios fijos, cero anticipos y pago contra entrega en Querétaro y 12 ciudades de México.",
    path: "/",
  });

  return (
    <div className="min-h-screen bg-background font-sans pb-16 md:pb-0">
      <Navbar />
      <main>
        {variant === "classic" ? <HeroClassic /> : <Hero />}
        <Reviews />
        <Services />
        {variant === "quote" && <Process />}
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
