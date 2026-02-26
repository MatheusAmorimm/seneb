import type { Metadata } from "next";
import { Nunito_Sans, Tinos, Karla } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from "../components/auth_provider";
import { ReportsProvider } from "../context/reports_context";
import { UpdateScreen } from "../components/update_screen";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const tinos = Tinos({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tinos",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seneb - Controle Financeiro",
  description: "Gerencie suas finanças com estabilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${nunito.variable} ${tinos.variable} ${karla.variable} antialiased bg-brand-cream text-zinc-800 font-sans`}
      >
        <UpdateScreen>
          <AuthProvider>
            <ReportsProvider>
            {children}
            </ReportsProvider>
          </AuthProvider>
        </UpdateScreen>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
