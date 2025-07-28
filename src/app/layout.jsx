import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "FinBuddy",
  description: "Track. Automate. Grow.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
