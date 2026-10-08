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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
