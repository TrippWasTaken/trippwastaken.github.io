import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import HomeTextContainer from "@/components/homeTextContainer";
import PhotoContainer from "@/components/photoContainer";

const fontFamily = Noto_Sans_JP({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "TrippMedia",
  description: "Tripps personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontFamily.className}>
        <main className="flex min-h-screen flex-col justify-center items-center p-0 m-0 relative">
          <HomeTextContainer />

          <PhotoContainer>{children}</PhotoContainer>
        </main>
      </body>
    </html>
  );
}
