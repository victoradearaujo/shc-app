import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import AssistantWidget from "@/components/assistant/AssistantWidget";

export const metadata: Metadata = {
  title: "Sunshine Hot Cars - Management",
  description: "Car detailing management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const assistantEnabled = process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true";

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        {assistantEnabled && <AssistantWidget />}
      </body>
    </html>
  );
}
