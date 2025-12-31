"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaGraduationCap, FaBook, FaChartLine, FaCalendarCheck, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const token = typeof window !== "undefined" && localStorage.getItem("token");

  const logoutHandler = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  // Don't show navbar on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-wide hover:scale-105 transition-transform">
          <FaGraduationCap className="text-3xl text-zinc-700 dark:text-zinc-300" />
          <span className="text-zinc-800 dark:text-zinc-100">
            PathPilot
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <NavLink href="/" isActive={isActive("/")} icon={<MdDashboard />} label="Dashboard" />
              <NavLink href="/courses" isActive={isActive("/courses")} icon={<FaBook />} label="Courses" />
              <NavLink href="/habits" isActive={isActive("/habits")} icon={<FaCalendarCheck />} label="Habits" />
              <NavLink href="/analytics" isActive={isActive("/analytics")} icon={<FaChartLine />} label="Analytics" />
              <ThemeToggle />
              <Button
                onClick={logoutHandler}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                size="sm"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push("/register")}
                size="sm"
                className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, isActive, icon, label }: { href: string; isActive: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isActive
            ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-md"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        {icon}
        <span className="hidden md:inline">{label}</span>
      </motion.div>
    </Link>
  );
}
