import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from '@clerk/themes'
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata = {
  title: "RiseAI",
  description: "AI powered assistant for your carreer growth",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className}`}
      >
        <ThemeProvider
          attribute="class"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider appearance={{ baseTheme: shadcn }}>

            {/* header */}
            <Header />

            {/* main */}
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster
              position="bottom-right"
              richColors
            />
            {/* footer */}
            <Footer />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
