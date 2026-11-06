import { useEffect } from "react";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
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
  // Limpiar cualquier anuncio flotante al entrar a Home
  useEffect(() => {
    const removeAdSenseOverlays = () => {
      const overlays = document.querySelectorAll(
        "ins.adsbygoogle[data-anchor-status], .google-auto-placed, iframe[id^='aswift_']"
      );
      overlays.forEach((el) => {
        // Solo remover elementos flotantes o anclados de pantalla completa
        if (el.parentElement === document.body || (el as HTMLElement).style.position === "fixed") {
          el.remove();
        }
      });
    };

    removeAdSenseOverlays();
    // Repetir brevemente por si AdSense intentaba inyectar
    const timeout = setTimeout(removeAdSenseOverlays, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans pb-16 md:pb-0">
      <Navbar />
      <main>
        <Hero />
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
