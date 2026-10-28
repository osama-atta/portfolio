import type { Metadata, Viewport } from "next";
// Fonts are bundled from npm (Fontsource), so the site never calls out to Google Fonts.
import "@fontsource/chakra-petch/500.css";
import "@fontsource/chakra-petch/600.css";
import "@fontsource/chakra-petch/700.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Osama Atta · Full-stack software engineer in Omaha, NE, USA",
  description:
    "Osama Atta is a full-stack software engineer in Omaha, Nebraska, USA who builds the whole tech stack, AI included: Java/Spring, TypeScript/Angular, databases and AI-powered apps.",
};

export const viewport: Viewport = {
  themeColor: "#07120d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline script below may add a class to <html> before React loads.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Skip the boot screen if it already played in this browser session. Runs before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("oa-booted"))document.documentElement.classList.add("booted")}catch(e){}`,
          }}
        />
        {/* Without JavaScript there's no boot sequence, so never show or lock behind it. */}
        <noscript>
          <style>{`#boot{display:none!important}body{overflow:auto!important}.trace-draw,.via-pop{animation-play-state:running!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-board font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
