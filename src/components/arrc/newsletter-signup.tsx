"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Loader2, CheckCircle2, Bell } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "section" | "compact" | "footer";
}

export function NewsletterSignup({ variant = "section" }: NewsletterSignupProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!consentProcessing) {
      setError("Please consent to the processing of your information.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: fullName || null,
          consentProcessing: true,
          consentMarketing,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to subscribe.");
        return;
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setConsentProcessing(false);
      setConsentMarketing(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Success State ─── */
  if (success) {
    return (
      <div className={`text-center ${variant === "section" ? "py-12" : "py-6"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
        >
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </motion.div>
        <h3 className="font-heading font-bold text-lg mb-2">You&apos;re Subscribed!</h3>
        <p className="text-sm text-arrc-600 mb-4 max-w-md mx-auto">
          Thank you for joining the ARRC newsletter. You&apos;ll receive our latest news and updates.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuccess(false)}
          className="border-arrc-200"
        >
          Subscribe another email
        </Button>
      </div>
    );
  }

  /* ─── Footer Variant (compact) ─── */
  if (variant === "footer" || variant === "compact") {
    return (
      <div className={variant === "footer" ? "text-white" : ""}>
        {variant === "footer" && (
          <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-arrc-gold" />
            Newsletter
          </h3>
        )}
        <p className={`text-sm mb-3 ${variant === "footer" ? "text-white/60" : "text-arrc-600"}`}>
          Get the latest ARRC news delivered to your inbox.
        </p>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={
              variant === "footer"
                ? "bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-arrc-gold"
                : "border-arrc-200 focus:border-arrc-gold"
            }
          />
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={consentProcessing}
              onCheckedChange={(v) => setConsentProcessing(v === true)}
              className="mt-0.5"
            />
            <span className={`text-xs leading-relaxed ${variant === "footer" ? "text-white/50" : "text-arrc-500"}`}>
              I consent to the ARRC processing my information (POPIA).
            </span>
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold"
            size="sm"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Bell className="h-4 w-4 mr-1.5" /> Subscribe</>}
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Section Variant (full) ─── */
  return (
    <div className="px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-xl"
      >
        <div className="rounded-2xl bg-gradient-to-br from-arrc-950 to-arrc-900 p-8 text-center text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-arrc-gold/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-arrc-gold/5 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-arrc-gold/20 mb-4">
              <Mail className="h-7 w-7 text-arrc-gold" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">Stay Informed</h2>
            <p className="text-white/60 text-sm mb-6">
              Subscribe to get our latest news, campaign updates, and event invitations first.
            </p>

            <div className="space-y-3 text-left">
              <div>
                <Label htmlFor="nl-name" className="text-xs text-white/50 mb-1 block">
                  Full Name (optional)
                </Label>
                <Input
                  id="nl-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-arrc-gold"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="nl-email" className="text-xs text-white/50 mb-1 block">
                  Email Address *
                </Label>
                <Input
                  id="nl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-arrc-gold"
                  placeholder="you@example.com"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={consentProcessing}
                  onCheckedChange={(v) => setConsentProcessing(v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs text-white/50 leading-relaxed">
                  I agree to allow the ARRC to process my information for a lawful purpose,
                  in-line with the ARRC&apos;s activities and in compliance with POPIA. The ARRC
                  will never share my information with a third party.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={consentMarketing}
                  onCheckedChange={(v) => setConsentMarketing(v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs text-white/50 leading-relaxed">
                  I consent to receive occasional future communication from the ARRC sharing
                  important news and information about campaign and election activities, as well
                  as fundraising appeals.
                </span>
              </label>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                {submitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
