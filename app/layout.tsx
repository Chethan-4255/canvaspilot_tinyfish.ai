import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CanvasPilot — Your Canvas week, in one digest",
  description: "A TinyFish agent that reads your signed-in Canvas LMS for what's due, new grades and feedback, announcements and inbox, then syncs deadlines to your calendar.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
