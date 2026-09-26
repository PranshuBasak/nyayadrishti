import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyayaDrishti AI (न्यायदृष्टि) — Indian Multimodal Legal Companion",
  description:
    "Understand, question, compare, and prepare legal documents under the Indian legal ecosystem. Powered by multimodal GenAI with local-first privacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
