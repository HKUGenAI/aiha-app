import "@/styles/globals.css";
import NavLinks from "@/components/nav-links";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import Link from "next/link";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "AIHA",
  description: "AI Historian Assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <div className="relative min-h-screen bg-background">
          {/* Navigation Bar */}
          <nav className="h-16 border-b bg-card shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex items-center">
                  {/* Logo/Home Link */}
                  <div className="flex flex-shrink-0 items-center">
                    <Link
                      href="/"
                      className="text-xl font-bold text-foreground"
                    >
                      AIHA
                    </Link>
                  </div>
                  {/* Main Navigation Links */}
                  <div className="hidden sm:ml-3 sm:flex">
                    <NavLinks />
                  </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center">
                  {session ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-foreground">
                          {session.user?.name}
                        </span>
                        <img
                          src={session.user?.image!}
                          className="h-8 w-8 rounded-full"
                          alt="Profile"
                        />
                      </div>
                      <Link
                        href="/api/auth/signout"
                        className="rounded-md bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/70"
                      >
                        Sign Out
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href="/api/auth/signin"
                      className="rounded-md bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/70"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-grow justify-center px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="h-16 border-t bg-card">
            <div className="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} AIHA. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
