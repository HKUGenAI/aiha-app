import "@/styles/globals.css";

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
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <div className="min-h-screen bg-gray-50 relative">
          {/* Navigation Bar */}
          <nav className="border-b bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  {/* Logo/Home Link */}
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/" className="text-xl font-bold">
                      AIHA
                    </Link>
                  </div>
                  {/* Main Navigation Links */}
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      href="/projects"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Projects
                    </Link>
                    {/* Add more navigation links as needed */}
                  </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center">
                  {session ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-700">
                          {session.user?.name}
                        </span>
                        <img
                          src={session.user?.image!}
                          className="h-8 w-8 rounded-full"
                        />
                      </div>
                      <Link
                        href="/api/auth/signout"
                        className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Sign Out
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href="/api/auth/signin"
                      className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 min-h-[90vh]">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} AIHA. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
