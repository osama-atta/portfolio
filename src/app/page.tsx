import { SpineProvider } from "@/components/circuit/SpineProvider";
import { BootScreen } from "@/components/BootScreen";
import { Header } from "@/components/Header";
import { DisplayModule } from "@/components/DisplayModule";
import { Hero } from "@/components/Hero";
import { NowSection } from "@/components/NowSection";
import { SkillsAndWork } from "@/components/SkillsAndWork";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";

/*
  Each section has a power index (0–6): display, hero, now, skills,
  experience, education, contact. A section powers when the current reaches
  the point where its branch leaves the spine.

  Section 2 is "What I'm working on now". The impact-numbers section is still
  in components/Metrics.tsx; to switch back, swap <NowSection /> for <Metrics />
  (and the "Now" nav link in Header.tsx back to "#impact").
*/
export default function Home() {
  return (
    <div id="top">
      <BootScreen />
      <SpineProvider>
        <Header />
        <div className="flex flex-col gap-24 pt-3" style={{ marginLeft: "calc(var(--rail) + 20px)" }}>
          <main className="flex flex-col gap-24">
            <DisplayModule />
            <Hero />
            <NowSection />
            <SkillsAndWork />
            <Experience />
          </main>
          <Contact />
        </div>
      </SpineProvider>
    </div>
  );
}
