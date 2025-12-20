import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@assets/Logo-Monster-sin-fondo_1766172236864.webp";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const links = [
    { name: "Inicio", href: "/#home" },
    { name: "Servicios", href: "/#services" },
    { name: "Zonas", href: "/#zones" },
    { name: "Precios", href: "/#pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/#contact" },
  ];

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "#");
      if (location === "/") {
        // Already on home page, just scroll
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to home page then scroll
        setLocation("/");
        // Give time for navigation to happen before scrolling
        setTimeout(() => {
          const element = document.querySelector(targetId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } else {
      // Regular navigation (e.g. /blog)
      setLocation(href);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-brand font-black text-3xl text-black hover:opacity-90 transition-opacity tracking-wide" style={{ WebkitTextStroke: "1.5px hsl(var(--primary))" }}>
            <img src={logo} alt="MonsterCo" className="h-12 w-auto object-contain" />
            <span className="pt-1">MonsterCo</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavigation(e, link.href)}
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
            >
              {link.name}
            </a>
          ))}
          <Button className="bg-accent hover:bg-accent/90 text-white font-bold" asChild>
            <a href="/#contact" onClick={(e) => handleNavigation(e, "/#contact")}>
              Cotizar Ahora
            </a>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-lg font-medium hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}
                <Button className="bg-accent hover:bg-accent/90 text-white w-full" asChild>
                  <a href="/#contact" onClick={(e) => handleNavigation(e, "/#contact")}>
                    Cotizar Ahora
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
