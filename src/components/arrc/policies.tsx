"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { fetchContent } from "@/lib/content-client";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SecurePdfViewer, type DocumentItem } from "@/components/arrc/document-viewer";
import {
  Check,
  ScrollText,
  FileText,
  Shield,
  TrendingUp,
  GraduationCap,
  HeartPulse,
  Map as MapIcon,
  Leaf,
  type LucideIcon,
} from "lucide-react";

interface Policy {
  id: string;
  title: string;
  image: string;
  bullets: string[];
  detail: string;
  docId?: string;
}

/* Map policy titles to document IDs for the read-only PDF viewer */
const policyToDocId: Record<string, string> = {
  "Economic Freedom": "arrc-2026-manifesto",
  "Quality Education": "arrc-2026-manifesto",
  "Healthcare for All": "arrc-2026-manifesto",
  "Land Reform": "arrc-2026-manifesto",
  "Environmental Justice": "arrc-2026-manifesto",
  "Safety & Security": "arrc-2026-manifesto",
};

/* Distinct icon per policy title — gives every card a unique visual identity
   whether or not it has a photographic thumbnail. */
const policyIcon: Record<string, LucideIcon> = {
  "Economic Freedom": TrendingUp,
  "Quality Education": GraduationCap,
  "Healthcare for All": HeartPulse,
  "Land Reform": MapIcon,
  "Environmental Justice": Leaf,
  "Safety & Security": Shield,
};

const fallbackIcon = ScrollText;

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.93 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.15 + i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const handleReadFullPolicy = (policy: Policy) => {
    if (!policy.docId) return;
    const doc: DocumentItem = {
      id: policy.docId,
      title: `${policy.title} Policy`,
      description: policy.detail,
      pdfUrl: `/api/documents?id=${policy.docId}`,
      icon: ScrollText,
      category: "Policy",
    };
    setViewingDoc(doc);
  };

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.policies) {
          setPolicies(
            data.policies.map((item: Record<string, unknown>) => {
              const metadata = (item.metadata as Record<string, unknown>) || {};
              const title = item.title as string;
              return {
                id: item.id as string,
                title,
                image: (item.imageUrl as string) || "",
                bullets: (metadata.bullets as string[]) || [],
                detail: (metadata.detail as string) || (item.description as string) || "",
                docId: policyToDocId[title],
              };
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  return (
    <section id="policies" className="relative py-20 overflow-hidden bg-gradient-to-b from-arrc-50/30 via-white to-arrc-50/20">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 african-pattern opacity-[0.02] pointer-events-none" />

      <div ref={sectionRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-4xl font-bold text-arrc-950 sm:text-5xl font-heading">
            Our Policies for a Better South Africa
          </h2>
          {/* Gold diamond decorator between heading and underline */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-arrc-gold/40" />
            <span className="text-arrc-gold text-xs">◆</span>
            <div className="h-px w-12 bg-arrc-gold/40" />
          </div>
          <div className="mt-2 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Progressive, people-centred policies designed to transform South
            Africa for the benefit of all who call it home.
          </p>
        </motion.div>

        {policies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy, i) => {
              const Icon = policyIcon[policy.title] || fallbackIcon;
              return (
              <motion.div
                key={policy.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              >
                <button
                  onClick={() => setSelectedPolicy(policy)}
                  className="group w-full text-left h-full card-premium overflow-hidden border-t-4 border-t-arrc-gold cursor-pointer hover:border-l-4 hover:border-l-arrc-gold transition-all duration-300"
                >
                  {/* Policy thumbnail / icon panel */}
                  <div className="relative h-44 overflow-hidden bg-arrc-950 img-zoom">
                    {policy.image ? (
                      <>
                        <Image
                          src={policy.image}
                          alt={policy.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Floating icon chip — ties photographic cards
                            visually to the icon-only cards */}
                        <div className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-arrc-950/70 backdrop-blur-sm border border-arrc-gold/30 pointer-events-none">
                          <Icon className="h-4 w-4 text-arrc-gold" />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon className="h-12 w-12 text-arrc-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-arrc-950/70 via-arrc-950/20 to-transparent pointer-events-none" />
                  </div>
                  {/* Policy content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arrc-gold/10">
                        <Icon className="h-4 w-4 text-arrc-gold" />
                      </div>
                      <h3 className="font-bold font-heading text-arrc-950 text-lg">{policy.title}</h3>
                    </div>
                    {/* Subtle gold accent line below title */}
                    <div className="h-px w-12 bg-gradient-to-r from-arrc-gold to-transparent mb-3" />
                    {policy.bullets.length > 0 && (
                      <ul className="space-y-1.5">
                        {policy.bullets.slice(0, 3).map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="h-4 w-4 text-arrc-gold mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{bullet}</span>
                          </li>
                        ))}
                        {policy.bullets.length > 3 && (
                          <li className="text-xs text-arrc-gold font-medium">+{policy.bullets.length - 3} more priorities</li>
                        )}
                      </ul>
                    )}
                    {policy.detail && !policy.bullets.length && (
                      <p className="text-sm text-gray-600 line-clamp-3">{policy.detail}</p>
                    )}
                    {/* Gold gradient line at bottom of card content */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-arrc-gold/30 to-transparent mt-4" />
                  </div>
                </button>
              </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-arrc-gold/10">
              <ScrollText className="h-8 w-8 text-arrc-gold" />
            </div>
            <p className="text-gray-500 text-lg font-heading">Policies coming soon</p>
            <p className="text-gray-400 text-sm mt-1">Our policy framework will be published shortly</p>
          </motion.div>
        )}
      </div>

      {/* Policy Detail Dialog */}
      <Dialog
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedPolicy && (() => {
            const DialogIcon = policyIcon[selectedPolicy.title] || fallbackIcon;
            return (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-arrc-gold text-arrc-950">
                    <DialogIcon className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl text-arrc-950 font-heading">
                    {selectedPolicy.title} Policy
                  </DialogTitle>
                </div>
                <DialogDescription className="sr-only">
                  Detailed information about ARRC&apos;s{" "}
                  {selectedPolicy.title} policy
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {selectedPolicy.bullets.length > 0 && (
                  <>
                    <h4 className="font-semibold text-arrc-950">Key Priorities</h4>
                    <ul className="space-y-2">
                      {selectedPolicy.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check className="h-4 w-4 text-arrc-gold mt-0.5 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <h4 className="font-semibold text-arrc-950">
                  Our Commitment
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedPolicy.detail}
                </p>
                {/* Read Full Policy Document Button */}
                {selectedPolicy.docId && (
                  <div className="pt-3">
                    <Button
                      onClick={() => handleReadFullPolicy(selectedPolicy)}
                      className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Read Full Policy Document
                      <Shield className="h-3.5 w-3.5 ml-2" />
                    </Button>
                    <p className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      Read-only — not downloadable
                    </p>
                  </div>
                )}
              </div>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Secure PDF Viewer for policy documents */}
      {viewingDoc && (
        <SecurePdfViewer
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </section>
  );
}
