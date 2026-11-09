import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ADSENSE_SCRIPT_ID } from "@/components/blog/AdSenseBanner";

const isAdRoute = (pathname: string) => pathname === "/blog" || pathname.startsWith("/blog/");

/**
 * Los anuncios automáticos de AdSense siguen vivos mientras la pestaña no se recargue,
 * y sus exclusiones por URL solo se evalúan al cargar la página. Al salir del blog
 * recargamos para descargar el script y dejar limpio el resto del sitio.
 */
export default function AdRouteGuard() {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useLayoutEffect(() => {
    const leftAdRoute = isAdRoute(previousPathname.current) && !isAdRoute(pathname);
    previousPathname.current = pathname;

    if (leftAdRoute && document.getElementById(ADSENSE_SCRIPT_ID)) {
      window.location.reload();
    }
  }, [pathname]);

  return null;
}
