import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "VatroVisuals - Graphic & Motion Designer",
  description:
    "Cześć! Nazywam się Piotr vatro_visuals Doniek. Jestem motion designerem i grafikiem, który zamienia pomysły w angażujące formy wizualne.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/vatro_visuals_website_icon.png?v=4",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <head>
        <meta
          name="google-site-verification"
          content="LsbL9cyV3LVsVU9It50Ln-X0OrVnTOw_e6MCoM4mAkw"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>VatroVisuals - Graphic &amp; Motion Designer</title>
        <meta
          name="description"
          content="Cześć! Nazywam się Piotr vatro_visuals Doniek. Jestem motion designerem i grafikiem, który zamienia pomysły w angażujące formy wizualne."
        />
        <meta name="author" content="Vatro_Visuals" />
        <meta
          name="keywords"
          content="Vatro_Visuals, grafik komputerowy, portfolio, 3D, animacja, branding, motion design, projekty graficzne, artysta, digital art, wizualizacje, logo, grafika użytkowa"
        />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="VatroVisuals - Graphic &amp; Motion Designer"
        />
        {/* Favicons: prefer /favicon.ico, keep PNG as fallback for apple/touch */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/vatro_visuals_website_icon.png?v=3"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/vatro_visuals_website_icon.png?v=3"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/vatro_visuals_website_icon.png?v=3"
        />
        <meta name="theme-color" content="#080808" />
        {/* Inline SVG removed; using versioned PNG favicons instead */}
        <meta
          property="og:description"
          content="Cześć! Nazywam się Piotr vatro_visuals Doniek. Jestem motion designerem i grafikiem, który zamienia pomysły w angażujące formy wizualne."
        />
        <meta property="og:url" content="https://vatro-visuals.vercel.app/" />
        <meta
          property="og:image"
          content="https://vatro-visuals.vercel.app/Logo%20Merged.svg"
        />
        <meta property="og:site_name" content="Vatro Visuals" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="VatroVisuals - Graphic &amp; Motion Designer"
        />
        <meta
          name="twitter:description"
          content="Cześć! Nazywam się Piotr vatro_visuals Doniek. Jestem motion designerem i grafikiem, który zamienia pomysły w angażujące formy wizualne."
        />
        <meta
          name="twitter:image"
          content="https://vatro-visuals.vercel.app/Logo%20Merged.svg"
        />
        <meta name="twitter:site" content="@Vatro_Visuals" />
        <meta name="twitter:creator" content="@Vatro_Visuals" />
        {/* Preload SVG logo for instant display */}
        <link
          rel="preload"
          as="image"
          href="/Logo%20Merged.svg"
          type="image/svg+xml"
        />
        {/* removed duplicate favicon links */}
        {/* ...other meta tags... */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-font`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
