import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { AmplitudeInit } from "@/components/amplitude-init";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Proveedor Regional";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Agente de voz de Proveedor Regional. Conversación con audio generado por IA sobre membresía, niveles y valor retenido en Antofagasta.",
      },
      { name: "theme-color", content: "#1a3a62" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preload", as: "image", href: "/culpeo/idle.webp" },
      { rel: "preload", as: "image", href: "/culpeo/horizon.webp" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AmplitudeInit />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-paper-raised)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-line)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  ),
});
