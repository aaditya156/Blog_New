import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "PulseBlog | Microservice-Driven Publishing Platform",
  description: "Next-generation distributed blogging system built with Next.js, Node.js microservices, RabbitMQ, and MongoDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <AppProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
