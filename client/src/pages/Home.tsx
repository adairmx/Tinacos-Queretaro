import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import ServiceZones from "@/components/sections/ServiceZones";
import Pricing from "@/components/sections/Pricing";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import WhatsAppButton from "@/components/sections/WhatsAppButton";
import TrustBadge from "@/components/sections/TrustBadge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <Hero />
        <TrustBadge />
        <Services />
        <ServiceZones />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
