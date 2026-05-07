"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaBook,
  FaChartLine,
  FaCalendarCheck,
  FaCalendar,
  FaTrophy,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-wide hover:scale-105 transition-transform"
          >
            <FaGraduationCap className="text-2xl sm:text-3xl text-zinc-700 dark:text-zinc-300" />
            <span className="text-zinc-800 dark:text-zinc-100">PathPilot</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <NavLink
              href="/dashboard"
              isActive={isActive("/dashboard")}
              icon={<MdDashboard />}
              label="Dashboard"
            />
            <NavLink
              href="/courses"
              isActive={isActive("/courses")}
              icon={<FaBook />}
              label="Courses"
            />
            <NavLink
              href="/habits"
              isActive={isActive("/habits")}
              icon={<FaCalendarCheck />}
              label="Habits"
            />
            <NavLink
              href="/analytics"
              isActive={isActive("/analytics")}
              icon={<FaChartLine />}
              label="Analytics"
            />
            <NavLink
              href="/calendar"
              isActive={isActive("/calendar")}
              icon={<FaCalendar />}
              label="Calendar"
            />
            <NavLink
              href="/badges"
              isActive={isActive("/badges")}
              icon={<FaTrophy />}
              label="Badges"
            />
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </Button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-[57px] sm:top-[65px] right-0 bottom-0 w-[280px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-2">
                <MobileNavLink
                  href="/dashboard"
                  isActive={isActive("/dashboard")}
                  icon={<MdDashboard />}
                  label="Dashboard"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/courses"
                  isActive={isActive("/courses")}
                  icon={<FaBook />}
                  label="Courses"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/habits"
                  isActive={isActive("/habits")}
                  icon={<FaCalendarCheck />}
                  label="Habits"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/analytics"
                  isActive={isActive("/analytics")}
                  icon={<FaChartLine />}
                  label="Analytics"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/calendar"
                  isActive={isActive("/calendar")}
                  icon={<FaCalendar />}
                  label="Calendar"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  href="/badges"
                  isActive={isActive("/badges")}
                  icon={<FaTrophy />}
                  label="Badges"
                  onClick={closeMenu}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  isActive,
  icon,
  label,
}: {
  href: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
          isActive
            ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-md"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        {icon}
        <span>{label}</span>
      </motion.div>
    </Link>
  );
}

function MobileNavLink({
  href,
  isActive,
  icon,
  label,
  onClick,
}: {
  href: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive
            ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-md"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-base">{label}</span>
      </motion.div>
    </Link>
  );
}
