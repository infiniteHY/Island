import { useEffect, useLayoutEffect } from "react";
import { useSiteStore } from "./siteStore";
import { Header } from "./Header";
import { BottleHero } from "./glass-bottle/BottleHero";
import { Work } from "./Work";
import { RoomSection } from "./room/RoomSection";
import { Cta } from "./Cta";
import { Footer } from "./Footer";
import { Atmosphere } from "./fx/Atmosphere";
import { Crosshair } from "./fx/Crosshair";

export function Site() {
  const theme = useSiteStore((state) => state.theme);
  const setReducedMotion = useSiteStore((state) => state.setReducedMotion);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [setReducedMotion]);

  return (
    <div id="top" className="site">
      <Atmosphere />
      <Crosshair />
      <Header />
      <main>
        <BottleHero />
        <Work />
        <RoomSection />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
