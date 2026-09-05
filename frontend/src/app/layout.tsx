import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "RecoverAI - Autonomous Policy-Guarded Debt Recovery & Simulation Engine",
  description: "Enterprise agentic debt recovery with deterministic policy guardrails and ML risk scoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-charcoal-900 text-taupe-100 min-h-screen flex flex-col font-sans selection:bg-olive-800 selection:text-taupe-100">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
