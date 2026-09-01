"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigation } from "@/components/arrc/navigation";
import { Hero } from "@/components/arrc/hero";
import { About } from "@/components/arrc/about";
import { Policies } from "@/components/arrc/policies";
import { Gallery } from "@/components/arrc/gallery";
import { VideoGallery } from "@/components/arrc/video-gallery";
import { NEC } from "@/components/arrc/nec";
import { News } from "@/components/arrc/news";
import { Events } from "@/components/arrc/events";
import { Membership } from "@/components/arrc/membership";
import { MembershipFormDownload } from "@/components/arrc/membership-form-download";
import { FAQ } from "@/components/arrc/faq";
import { Footer } from "@/components/arrc/footer";
import { ChatAssistant } from "@/components/arrc/chat-assistant";
import { CookieConsent } from "@/components/arrc/cookie-consent";
import { LegalModals } from "@/components/arrc/legal-modals";
import { CRMPanel } from "@/components/arrc/crm-panel";
import { QRCodeButton } from "@/components/arrc/qr-code";
import { SectionPage } from "@/components/arrc/section-page";
import { HomeHighlights } from "@/components/arrc/home-highlights";
import { HomeStats } from "@/components/arrc/home-stats";
import { DocumentViewer } from "@/components/arrc/document-viewer";
import { MemberPortal } from "@/components/arrc/member-portal";
import { NewsletterSignup } from "@/components/arrc/newsletter-signup";
import { MarketingCarousel } from "@/components/arrc/marketing-carousel";

/* ─── Hash-to-view mapping for intercepting legacy hash links ─── */
const hashToView: Record<string, string> = {
  "#home": "home",
  "#about": "about",
  "#policies": "policies",
  "#gallery": "gallery",
  "#media": "gallery",
  "#videos": "gallery",
  "#nec": "nec",
  "#news": "news",
  "#events": "events",
  "#documents": "documents",
  "#portal": "portal",
  "#join": "join",
  "#contact": "join",
  "#faq": "join",
  "#membership": "join",
};

/* ─── Reverse mapping: view name → URL hash ─── */
const viewToHash: Record<string, string> = {
  home: "",
  about: "#about",
  policies: "#policies",
  gallery: "#gallery",
  nec: "#nec",
  news: "#news",
  events: "#events",
  documents: "#documents",
  portal: "#portal",
  join: "#join",
};

/* ─── View-to-title mapping for SectionPage headers ─── */
const viewTitles: Record<string, string> = {
  about: "About The ARRC",
  policies: "Our Policies",
  gallery: "Media Gallery",
  nec: "National Executive Committee",
  news: "Latest News",
  events: "Events & Gatherings",
  documents: "Official Documents",
  portal: "Member Portal",
  join: "Join The Movement",
};

/* ─── Page transition variants ─── */
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/* ─── Read initial view from URL hash (lazy initializer, runs once) ─── */
function getInitialView(): string {
  if (typeof window === "undefined") return "home";
  const hash = window.location.hash;
  return hashToView[hash] || "home";
}

export default function Home() {
  const [currentView, setCurrentView] = useState(getInitialView);
  const [showCRM, setShowCRM] = useState(false);

  /* ─── Navigate to a view, update URL hash, and scroll to top ─── */
  const setView = useCallback((view: string) => {
    setCurrentView(view);
    const hash = viewToHash[view] || "";
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ─── Listen for CRM open event from footer ─── */
  useEffect(() => {
    const handler = () => setShowCRM(true);
    window.addEventListener("arrc:open-crm", handler);
    return () => window.removeEventListener("arrc:open-crm", handler);
  }, []);

  /* ─── Listen for browser back/forward (hash changes) ─── */
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const view = hashToView[hash] || "home";
      setCurrentView(view);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  /* ─── Intercept clicks on hash-based anchor links ─── */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash) return;
      const view = hashToView[hash];
      if (view) {
        e.preventDefault();
        e.stopPropagation();
        setView(view);
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [setView]);

  /* ─── Render the current view's content ─── */
  const renderView = () => {
    switch (currentView) {
      /* ─── HOME VIEW ─── */
      case "home":
        return (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Hero />
            <MarketingCarousel onNavigate={setView} />
            <HomeStats onNavigate={setView} />
            <div className="section-separator section-separator-light" />
            <About />
            <div className="section-separator section-separator-light" />
            <HomeHighlights onNavigate={setView} />
            <div className="section-separator section-separator-light" />
            <Membership />
            <div className="section-separator section-separator-light" />
            <NewsletterSignup variant="section" />
            <div className="section-separator section-separator-light" />
            <FAQ />
          </motion.div>
        );

      /* ─── ABOUT VIEW ─── */
      case "about":
        return (
          <motion.div
            key="about"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.about} onBack={() => setView("home")}>
              <About />
            </SectionPage>
          </motion.div>
        );

      /* ─── POLICIES VIEW ─── */
      case "policies":
        return (
          <motion.div
            key="policies"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.policies} onBack={() => setView("home")}>
              <Policies />
            </SectionPage>
          </motion.div>
        );

      /* ─── GALLERY / MEDIA VIEW ─── */
      case "gallery":
        return (
          <motion.div
            key="gallery"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.gallery} onBack={() => setView("home")}>
              <Gallery />
              <div className="section-separator section-separator-dark" />
              <VideoGallery />
            </SectionPage>
          </motion.div>
        );

      /* ─── NEC VIEW ─── */
      case "nec":
        return (
          <motion.div
            key="nec"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.nec} onBack={() => setView("home")}>
              <NEC />
            </SectionPage>
          </motion.div>
        );

      /* ─── NEWS VIEW ─── */
      case "news":
        return (
          <motion.div
            key="news"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.news} onBack={() => setView("home")}>
              <News />
            </SectionPage>
          </motion.div>
        );

      /* ─── EVENTS VIEW ─── */
      case "events":
        return (
          <motion.div
            key="events"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.events} onBack={() => setView("home")}>
              <Events />
            </SectionPage>
          </motion.div>
        );

      /* ─── DOCUMENTS VIEW ─── */
      case "documents":
        return (
          <motion.div
            key="documents"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.documents} onBack={() => setView("home")}>
              <DocumentViewer />
            </SectionPage>
          </motion.div>
        );

      /* ─── JOIN VIEW ─── */
      case "join":
        return (
          <motion.div
            key="join"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.join} onBack={() => setView("home")}>
              <Membership />
              <div className="section-separator section-separator-light" />
              <MembershipFormDownload />
              <div className="section-separator section-separator-light" />
              <FAQ />
            </SectionPage>
          </motion.div>
        );

      /* ─── MEMBER PORTAL VIEW ─── */
      case "portal":
        return (
          <motion.div
            key="portal"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SectionPage title={viewTitles.portal} onBack={() => setView("home")}>
              <MemberPortal />
            </SectionPage>
          </motion.div>
        );

      /* ─── FALLBACK ─── */
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentView={currentView} setView={setView} />
      <main className="flex-1">
        <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
      </main>
      <Footer />
      <ChatAssistant />
      <CookieConsent />
      <LegalModals />
      {showCRM && <CRMPanel onClose={() => setShowCRM(false)} />}
      <QRCodeButton />
    </div>
  );
}
