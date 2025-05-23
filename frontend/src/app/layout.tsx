"use client";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const hideNavbarRoutes = ['/login', '/register'];

  const shouldShowNavbar = !hideNavbarRoutes.includes(pathname);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          { shouldShowNavbar && <Navbar />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
