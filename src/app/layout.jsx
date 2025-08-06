// app/layout.jsx
import "./globals.css";
import SupabaseWrapper from "@/lib/SupabaseWrapper"; // 👈 this will be a client component
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "FinBuddy",
  description: "Track. Automate. Grow.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <SupabaseWrapper>
          <Navbar />
          {children}
        </SupabaseWrapper>
      </body>
    </html>
  );
}
