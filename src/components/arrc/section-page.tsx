"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionPageProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function SectionPage({ title, onBack, children }: SectionPageProps) {
  return (
    <div>
      {/* Sticky breadcrumb header */}
      <div className="sticky top-[65px] z-40 bg-arrc-950/95 backdrop-blur-md border-b border-arrc-gold/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-4 w-0.5 rounded-full bg-arrc-gold/40" />
            <span className="text-sm font-heading font-medium text-white/50">Home</span>
            <span className="text-white/30">/</span>
            <span className="text-sm font-heading font-semibold text-arrc-gold">{title}</span>
          </div>
        </div>
      </div>

      {/* Page content with fade-in animation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
