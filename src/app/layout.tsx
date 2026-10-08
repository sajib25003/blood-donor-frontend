import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LogoThemeFilter from "../components/LogoThemeFilter";

const themeScript = `try { document.documentElement.classList.toggle('dark', localStorage.getItem('blood-donors-theme') === 'dark'); } catch {}`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bangladeshi Blood Donors",
    template: "%s | Bangladeshi Blood Donors",
  },
  description:
    "Find blood donors by blood group, name or mobile number and register as a donor in the Bangladesh donor directory.",
  applicationName: "Bangladeshi Blood Donors",
  openGraph: {
    title: "Bangladeshi Blood Donors",
    description:
      "Find a blood donor or join the Bangladesh donor directory to help others when it matters.",
    siteName: "Bangladeshi Blood Donors",
    locale: "en_BD",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <LogoThemeFilter />
        {children}
      </body>
    </html>
  );
}
