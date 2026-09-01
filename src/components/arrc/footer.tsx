"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Crown, Mail, Phone, MapPin, ExternalLink, Heart, Shield, ArrowUp, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import Image from "next/image";
import { NewsletterSignup } from "@/components/arrc/newsletter-signup";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Policies", href: "#policies" },
  { label: "Videos", href: "#videos" },
  { label: "NEC", href: "#nec" },
  { label: "Events", href: "#events" },
  { label: "Documents", href: "#documents" },
];

const socialLinks = [
  { label: "Facebook", icon: Facebook, href: "https://facebook.com/arrc" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com/arrc" },
  { label: "X (Twitter)", icon: Twitter, href: "https://x.com/arrc" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com/@arrc" },
];

const legalLinks = [
  { label: "Privacy Policy", event: "arrc:open-privacy" },
  { label: "Terms of Service", event: "arrc:open-terms" },
  { label: "POPIA Compliance", event: "arrc:open-popia" },
];

function dispatchLegalEvent(eventName: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(eventName));
  }
}

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-50px" });

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <footer id="contact" className="relative bg-arrc-950 text-white overflow-hidden">
      {/* Thicker gradient line with gold glow */}
      <div className="relative h-0.5 bg-gradient-to-r from-arrc-800 via-arrc-gold to-arrc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-arrc-gold/40 to-transparent blur-sm" />
      </div>

      {/* African geometric pattern overlay */}
      <div className="absolute inset-0 african-pattern opacity-[0.025] pointer-events-none" />

      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-arrc-gold/3 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-arrc-700/5 blur-3xl" />
      </div>

      {/* Decorative gold corner accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-arrc-gold/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-arrc-gold/40 pointer-events-none" />
      <div className="absolute bottom-16 left-4 w-8 h-8 border-b-2 border-l-2 border-arrc-gold/40 pointer-events-none" />
      <div className="absolute bottom-16 right-4 w-8 h-8 border-b-2 border-r-2 border-arrc-gold/40 pointer-events-none" />

      <div ref={footerRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* Newsletter Signup Bar */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={-0.1}
          variants={fadeInUp}
          className="mb-12"
        >
          <div className="rounded-2xl bg-gradient-to-r from-arrc-900 to-arrc-800 border border-arrc-gold/20 p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              <div>
                <h3 className="font-heading text-xl font-bold text-white mb-1">
                  Stay Connected
                </h3>
                <p className="text-sm text-white/60">
                  Subscribe to our newsletter for the latest news, campaigns, and events.
                </p>
              </div>
              <NewsletterSignup variant="footer" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* About Column */}
          <motion.div custom={0} variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-arrc-gold/10 border border-arrc-gold/20 overflow-hidden">
                <Image
                  src="/logo.jpg"
                  alt="ARRC Logo"
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <span className="font-heading text-2xl font-bold tracking-wide">ARRC</span>
                <p className="text-[10px] text-arrc-gold/70 tracking-widest uppercase">Official</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              The African Royal Rainbow Congress — The People&apos;s Voice,
              South Africa&apos;s Strength. Building a better nation through
              progressive policies, transparency, and unity.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-arrc-gold/10 border border-arrc-gold/15 px-3 py-2">
              <Crown className="h-4 w-4 text-arrc-gold shrink-0" />
              <p className="text-sm font-semibold text-arrc-gold">
                Membership: R20/year
              </p>
            </div>

            {/* Social Media Links */}
            <div className="mt-4 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-arrc-gold/15 hover:border-arrc-gold/30 transition-all duration-300 group"
                >
                  <social.icon className="h-4 w-4 text-white/50 group-hover:text-arrc-gold transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div custom={0.1} variants={fadeInUp}>
            <h3 className="font-heading font-semibold text-white mb-5 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-arrc-gold" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="group gold-underline-hover flex items-center gap-2 text-sm text-white/50 hover:text-arrc-gold transition-colors duration-200 relative"
                  >
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-arrc-gold" />
                    <span className="relative">
                      {link.label}
                      <span className="gold-underline absolute -bottom-0.5 left-0 w-full h-px bg-arrc-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div custom={0.2} variants={fadeInUp}>
            <h3 className="font-heading font-semibold text-white mb-5 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-arrc-gold" />
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.event}>
                  <button
                    onClick={() => dispatchLegalEvent(link.event)}
                    className="group gold-underline-hover flex items-center gap-2 text-sm text-white/50 hover:text-arrc-gold transition-colors duration-200 relative"
                  >
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-arrc-gold" />
                    <span className="relative">
                      {link.label}
                      <span className="gold-underline absolute -bottom-0.5 left-0 w-full h-px bg-arrc-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div custom={0.3} variants={fadeInUp}>
            <h3 className="font-heading font-semibold text-white mb-5 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-arrc-gold" />
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-white/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arrc-gold/10 shrink-0">
                  <Mail className="h-4 w-4 text-arrc-gold" />
                </div>
                info@arrc.co.za
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arrc-gold/10 shrink-0">
                  <Phone className="h-4 w-4 text-arrc-gold" />
                </div>
                +27 69 1156 271
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arrc-gold/10 shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-arrc-gold" />
                </div>
                93 Grayston Drive, Sandton, South Africa
              </li>
              <li
                className="flex items-center gap-3 text-sm text-white/25 hover:text-white/50 cursor-pointer transition-colors"
                onClick={() => window.dispatchEvent(new CustomEvent("arrc:open-crm"))}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arrc-gold/5 shrink-0">
                  <Shield className="h-4 w-4 text-arrc-gold/40" />
                </div>
                Admin Portal
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* SA flag stripe */}
      <div className="sa-stripe" />

      {/* Copyright */}
      <div className="relative bg-arrc-950 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            © 2025–2026 <span className="font-heading">African Royal Rainbow Congress</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-white/30 flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-arrc-gold/50" /> for the people of South Africa
            </p>
            {/* Back to Top */}
            <button
              onClick={handleBackToTop}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-arrc-gold/10 border border-arrc-gold/20 hover:bg-arrc-gold/20 hover:border-arrc-gold/40 transition-all duration-300 group"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4 text-arrc-gold group-hover:translate-y-[-2px] transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
