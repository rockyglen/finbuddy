import "./globals.css";
import SupabaseWrapper from "@/lib/SupabaseWrapper";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "FinBuddy",
  description: "Track. Automate. Grow.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
        <SupabaseWrapper>
          <NavBar />
          {children}
        </SupabaseWrapper>
      </body>
    </html>
  );
}
