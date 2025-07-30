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
  title:
    "Vatro Visuals – Portfolio grafika komputerowego | 3D, animacja, branding",
  description:
    "Portfolio grafika komputerowego Vatro_Visuals. Projekty 3D, animacje, branding, motion design, grafika użytkowa. Zobacz realizacje i skontaktuj się!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="LsbL9cyV3LVsVU9It50Ln-X0OrVnTOw_e6MCoM4mAkw"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          Vatro Visuals – Portfolio grafika komputerowego | 3D, animacja,
          branding
        </title>
        <meta
          name="description"
          content="Portfolio grafika komputerowego Vatro_Visuals. Projekty 3D, animacje, branding, motion design, grafika użytkowa. Zobacz realizacje i skontaktuj się!"
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
          content="Vatro Visuals – Portfolio grafika komputerowego | 3D, animacja, branding"
        />
        <meta
          property="og:description"
          content="Portfolio grafika komputerowego Vatro_Visuals. Projekty 3D, animacje, branding, motion design, grafika użytkowa. Zobacz realizacje i skontaktuj się!"
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
          content="Vatro Visuals – Portfolio grafika komputerowego | 3D, animacja, branding"
        />
        <meta
          name="twitter:description"
          content="Portfolio grafika komputerowego Vatro_Visuals. Projekty 3D, animacje, branding, motion design, grafika użytkowa. Zobacz realizacje i skontaktuj się!"
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
