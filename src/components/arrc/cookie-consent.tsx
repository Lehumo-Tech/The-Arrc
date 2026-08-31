"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, Shield } from "lucide-react";

const bannerVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

function getInitialVisible() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem("arrc-cookie-consent");
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay showing the banner slightly for better UX
    const timer = setTimeout(() => {
      setVisible(getInitialVisible());
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("arrc-cookie-consent", "all");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("arrc-cookie-consent", "essential");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 pt-2">
            <div className="glass-dark liquid-glass-interactive p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-arrc-gold/15 border border-arrc-gold/30">
                    <Cookie className="h-5 w-5 text-arrc-gold" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">Cookie Notice</p>
                      <Shield className="h-3.5 w-3.5 text-arrc-gold/70" />
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      We use cookies to improve your experience and comply with the{" "}
                      <span className="font-semibold text-arrc-gold">
                        Protection of Personal Information Act (POPIA)
                      </span>
                      . By continuing, you agree to our cookie policy.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecline}
                    className="flex-1 sm:flex-initial border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white text-sm"
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="flex-1 sm:flex-initial bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-semibold text-sm shadow-md shadow-arrc-gold/20"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
