"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Crown, UserCircle } from "lucide-react";
import { ThemeToggle } from "@/components/arrc/theme-toggle";

const navLinks = [
  { label: "Home", view: "home" },
  { label: "About", view: "about" },
  { label: "Policies", view: "policies" },
  { label: "Media", view: "gallery" },
  { label: "NEC", view: "nec" },
  { label: "News", view: "news" },
  { label: "Events", view: "events" },
  { label: "Documents", view: "documents" },
  { label: "Join", view: "join" },
];

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
}

export function Navigation({ currentView, setView }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (view: string) => {
    setMobileOpen(false);
    setView(view);
  };

  return (
    <>
      {/* SA Flag Stripe - always on top */}
      <div className="sa-stripe fixed top-0 left-0 right-0 z-[60]" />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-1 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "liquid-glass-dark shadow-2xl shadow-arrc-950/30 border-b border-arrc-gold/20"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-2.5 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-arrc-gold/50 group-hover:ring-arrc-gold group-hover:shadow-[0_0_15px_rgba(212,168,67,0.5)] transition-all duration-300">
                <Image
                  src="/logo.jpg"
                  alt="ARRC Logo"
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <span className="text-xl font-heading font-bold text-white tracking-tight">
                ARRC
              </span>
            </motion.button>

            {/* Desktop Nav Links */}
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`group relative rounded-md px-3 py-2 text-sm font-heading font-medium tracking-wide transition-colors ${
                    currentView === link.view
                      ? "text-arrc-gold"
                      : "text-white/80 hover:text-white"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                  whileHover={{ y: -1 }}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-arrc-gold transition-all duration-300 ${
                      currentView === link.view
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-2 lg:flex">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Member Portal */}
              <motion.button
                onClick={() => handleNavClick("portal")}
                className="rounded-md px-3 py-2 text-sm font-heading font-medium text-white/70 hover:text-arrc-gold transition-colors flex items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Member Portal"
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden xl:inline">Portal</span>
              </motion.button>

              {/* Join */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleNavClick("join")}
                  className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold animate-pulse-glow gold-border-glow"
                  size="sm"
                >
                  <Crown className="h-4 w-4 mr-1.5" />
                  Join for R20
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <AnimatePresence>
                  {mobileOpen && (
                    <SheetContent
                      side="right"
                      className="bg-arrc-950 text-white border-arrc-800 w-72"
                    >
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                      {/* Gold line at top of mobile menu */}
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-arrc-gold to-transparent" />
                      <div className="flex flex-col gap-1 pt-6">
                        <motion.div
                          className="flex items-center gap-2.5 mb-6 px-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-arrc-gold/50">
                            <Image
                              src="/logo.jpg"
                              alt="ARRC Logo"
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <span className="text-xl font-heading font-bold">ARRC</span>
                        </motion.div>

                        <AnimatePresence>
                          {navLinks.map((link, i) => (
                            <motion.button
                              key={link.view}
                              onClick={() => handleNavClick(link.view)}
                              className={`rounded-md px-3 py-3 text-base font-heading font-medium text-left transition-all hover:pl-4 ${
                                currentView === link.view
                                  ? "text-arrc-gold border-l-2 border-l-arrc-gold bg-arrc-gold/5"
                                  : "text-white/80 hover:text-white hover:border-l-2 hover:border-l-arrc-gold"
                              }`}
                              initial={{ opacity: 0, x: 30 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -30 }}
                              transition={{ delay: i * 0.06, duration: 0.3 }}
                            >
                              {link.label}
                            </motion.button>
                          ))}
                        </AnimatePresence>

                        <motion.div
                          className="mt-6 px-3 space-y-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                        >
                          <Button
                            onClick={() => handleNavClick("portal")}
                            variant="outline"
                            className="w-full border-white/20 text-white/70 hover:bg-white/5 font-heading font-medium"
                          >
                            <UserCircle className="h-4 w-4 mr-1.5" />
                            Member Portal
                          </Button>
                          <Button
                            onClick={() => handleNavClick("join")}
                            className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold animate-pulse-glow gold-border-glow"
                          >
                            <Crown className="h-4 w-4 mr-1.5" />
                            Join for R20
                          </Button>
                        </motion.div>
                      </div>
                    </SheetContent>
                  )}
                </AnimatePresence>
              </Sheet>
            </div>
          </div>
        </nav>
      </motion.header>
    </>
  );
}
