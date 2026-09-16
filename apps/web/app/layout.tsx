import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seneb | Controle Financeiro Gratuito",
  description:
    "Controle financeiro pessoal e em grupo, 100% gratuito, para Windows e Linux. Lançamentos, metas, histórico mensal e análises de gastos.",
  metadataBase: new URL("https://seneb.com.br"),
  openGraph: {
    title: "Seneb | Controle Financeiro Gratuito",
    description: "Controle financeiro pessoal e em grupo, 100% gratuito, para Windows e Linux.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
