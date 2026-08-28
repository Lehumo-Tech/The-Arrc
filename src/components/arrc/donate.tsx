"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  HandHeart,
  CreditCard,
  Building2,
  QrCode,
  Check,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Copy,
  CheckCheck,
  Shield,
} from "lucide-react";

interface Campaign {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  status: string;
  goalAmount: number;
  raisedAmount: number;
  supporterGoal: number;
  supporterCount: number;
  featured: boolean;
  progressPercent: number;
  supporterProgressPercent: number;
}

const presetAmounts = [50, 100, 250, 500, 1000];

const bankDetails = {
  bank: "FNB (First National Bank)",
  accountName: "African Royal Rainbow Congress",
  accountNumber: "6320 0000 000", // Placeholder — admin updates via CRM
  branchCode: "250655",
  reference: "ARRC-DON-{your name}",
};

export function Donate() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [recurring, setRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState("monthly");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [anonymous, setAnonymous] = useState(false);

  // Donor info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"eft" | "card">("eft");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [donationRef, setDonationRef] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/donations/campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch {
      // Campaigns may be empty — that's fine
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleSubmit = async () => {
    setError("");
    if (!firstName || !lastName || !email || !phone) {
      setError("Please fill in all your details.");
      return;
    }
    if (!finalAmount || finalAmount <= 0) {
      setError("Please select or enter a valid donation amount.");
      return;
    }
    if (!consent) {
      setError("Please consent to the processing of your information.");
      return;
    }

    setSubmitting(true);
    try {
      const campaign = campaigns.find((c) => c.id === selectedCampaign);
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          amount: finalAmount,
          paymentMethod,
          campaignId: selectedCampaign || null,
          campaignTitle: campaign?.title || null,
          recurring,
          recurringPeriod: recurring ? recurringPeriod : null,
          anonymous,
          message: message || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process donation.");
        return;
      }

      setDonationRef(data.reference || "");
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyBankDetails = () => {
    const details = `Bank: ${bankDetails.bank}\nAccount Name: ${bankDetails.accountName}\nAccount Number: ${bankDetails.accountNumber}\nBranch Code: ${bankDetails.branchCode}\nReference: ${donationRef || "ARRC-DON-" + firstName.toUpperCase()}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Card className="bg-white border-arrc-gold/30 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-arrc-950 mb-3">
                Thank You for Your Support!
              </h2>
              <p className="text-arrc-700 mb-6">
                Your donation of <strong>R{finalAmount.toFixed(2)}</strong>
                {recurring ? ` (${recurringPeriod})` : ""} has been recorded.
                {paymentMethod === "eft" && " Please complete the EFT using the details below."}
              </p>

              <div className="bg-arrc-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-arrc-600 mb-1">Your Donation Reference:</p>
                <p className="font-mono font-bold text-arrc-950 text-lg">{donationRef}</p>
              </div>

              {paymentMethod === "eft" && (
                <div className="bg-arrc-950 text-white rounded-lg p-5 mb-6 text-left text-sm space-y-2">
                  <h3 className="font-heading font-bold text-arrc-gold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Bank Details for EFT
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-white/50">Bank:</span>
                    <span>{bankDetails.bank}</span>
                    <span className="text-white/50">Account:</span>
                    <span>{bankDetails.accountName}</span>
                    <span className="text-white/50">Acc No:</span>
                    <span className="font-mono">{bankDetails.accountNumber}</span>
                    <span className="text-white/50">Branch:</span>
                    <span className="font-mono">{bankDetails.branchCode}</span>
                    <span className="text-white/50">Reference:</span>
                    <span className="font-mono text-arrc-gold">{donationRef}</span>
                  </div>
                  <Button
                    onClick={copyBankDetails}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 border-arrc-gold/30 text-arrc-gold hover:bg-arrc-gold/10"
                  >
                    {copied ? <CheckCheck className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Bank Details"}
                  </Button>
                </div>
              )}

              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPhone("");
                  setMessage("");
                  setCustomAmount("");
                  setDonationRef("");
                }}
                className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold"
              >
                Make Another Donation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-4 py-1.5 mb-4">
            <Heart className="h-4 w-4 text-arrc-gold" />
            <span className="text-sm font-heading font-medium text-arrc-gold">Support Our Movement</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-arrc-950 mb-4">
            Help Us Build a Better South Africa
          </h1>
          <p className="text-lg text-arrc-700 max-w-2xl mx-auto">
            Your contribution fuels real change — from community upliftment to policy advocacy.
            Every rand makes a difference.
          </p>
        </motion.div>

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-heading font-bold text-arrc-950 mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-arrc-gold" />
              Active Campaigns
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-xl ${
                      selectedCampaign === c.id
                        ? "border-arrc-gold ring-2 ring-arrc-gold/30"
                        : "border-arrc-200 hover:border-arrc-gold/50"
                    }`}
                    onClick={() =>
                      setSelectedCampaign(selectedCampaign === c.id ? "" : c.id)
                    }
                  >
                    <CardContent className="p-5">
                      {c.imageUrl && (
                        <div className="mb-3 rounded-lg overflow-hidden h-32 bg-arrc-100">
                          <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="inline-block text-xs font-medium text-arrc-gold uppercase tracking-wide mb-2">
                        {c.category}
                      </span>
                      <h3 className="font-heading font-bold text-arrc-950 mb-2 line-clamp-2">{c.title}</h3>
                      <p className="text-sm text-arrc-600 mb-4 line-clamp-2">{c.summary}</p>

                      {c.goalAmount > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-arrc-950">
                              R{c.raisedAmount.toLocaleString()}
                            </span>
                            <span className="text-arrc-500">
                              of R{c.goalAmount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={c.progressPercent} className="h-2" />
                          <p className="text-xs text-arrc-500">{c.progressPercent}% raised</p>
                        </div>
                      )}

                      {selectedCampaign === c.id && (
                        <div className="mt-3 flex items-center gap-1.5 text-sm text-arrc-gold font-medium">
                          <Check className="h-4 w-4" /> Selected
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Donation Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Amount Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white border-arrc-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-arrc-950 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-arrc-gold" />
                  Choose Amount
                </h3>

                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {presetAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={selectedAmount === amt && !customAmount ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                      }}
                      className={
                        selectedAmount === amt && !customAmount
                          ? "bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold"
                          : "border-arrc-200 text-arrc-700 hover:border-arrc-gold"
                      }
                    >
                      R{amt}
                    </Button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="mb-4">
                  <Label htmlFor="custom" className="text-xs text-arrc-600 mb-1.5 block">
                    Or enter custom amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-arrc-500 font-medium">R</span>
                    <Input
                      id="custom"
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-8 border-arrc-200 focus:border-arrc-gold"
                    />
                  </div>
                </div>

                {/* Recurring toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={recurring}
                      onCheckedChange={(v) => setRecurring(v === true)}
                    />
                    <span className="text-sm text-arrc-700">Make this a recurring donation</span>
                  </label>
                  {recurring && (
                    <div className="mt-2 flex gap-2">
                      {["monthly", "quarterly", "annual"].map((p) => (
                        <Button
                          key={p}
                          variant={recurringPeriod === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setRecurringPeriod(p)}
                          className={
                            recurringPeriod === p
                              ? "bg-arrc-950 text-white text-xs"
                              : "border-arrc-200 text-arrc-600 text-xs"
                          }
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment method */}
                <div className="mb-4">
                  <Label className="text-xs text-arrc-600 mb-1.5 block">Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paymentMethod === "eft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethod("eft")}
                      className={
                        paymentMethod === "eft"
                          ? "bg-arrc-950 text-white"
                          : "border-arrc-200 text-arrc-600"
                      }
                    >
                      <Building2 className="h-4 w-4 mr-1.5" /> EFT
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethod("card")}
                      className={
                        paymentMethod === "card"
                          ? "bg-arrc-950 text-white"
                          : "border-arrc-200 text-arrc-600"
                      }
                    >
                      <CreditCard className="h-4 w-4 mr-1.5" /> Card
                    </Button>
                  </div>
                </div>

                {/* Anonymous */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={anonymous}
                    onCheckedChange={(v) => setAnonymous(v === true)}
                  />
                  <span className="text-sm text-arrc-700">Donate anonymously</span>
                </label>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-arrc-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-arrc-600">Total:</span>
                    <span className="text-2xl font-heading font-bold text-arrc-gold">
                      R{(finalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  {recurring && (
                    <p className="text-xs text-arrc-500 mt-1">
                      {recurringPeriod.charAt(0).toUpperCase() + recurringPeriod.slice(1)} donation
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Donor Info + Submit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white border-arrc-200">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-arrc-950 mb-4">
                  Your Details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div>
                    <Label htmlFor="d-firstName" className="text-sm text-arrc-700 mb-1.5 block">
                      First Name *
                    </Label>
                    <Input
                      id="d-firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border-arrc-200 focus:border-arrc-gold"
                      disabled={anonymous}
                    />
                  </div>
                  <div>
                    <Label htmlFor="d-lastName" className="text-sm text-arrc-700 mb-1.5 block">
                      Last Name *
                    </Label>
                    <Input
                      id="d-lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="border-arrc-200 focus:border-arrc-gold"
                      disabled={anonymous}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div>
                    <Label htmlFor="d-email" className="text-sm text-arrc-700 mb-1.5 block">
                      Email *
                    </Label>
                    <Input
                      id="d-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-arrc-200 focus:border-arrc-gold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="d-phone" className="text-sm text-arrc-700 mb-1.5 block">
                      Phone *
                    </Label>
                    <Input
                      id="d-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-arrc-200 focus:border-arrc-gold"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="d-message" className="text-sm text-arrc-700 mb-1.5 block">
                    Message (optional)
                  </Label>
                  <Textarea
                    id="d-message"
                    placeholder="Share why you're supporting the ARRC..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border-arrc-200 focus:border-arrc-gold min-h-[80px]"
                  />
                </div>

                {/* Consent */}
                <label className="flex items-start gap-2 cursor-pointer mb-4">
                  <Checkbox
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-arrc-600 leading-relaxed">
                    I consent to the processing of my personal information in accordance with
                    the Protection of Personal Information Act (POPIA) and the ARRC Privacy Policy.
                    The ARRC will never share my information with a third party.
                  </span>
                </label>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold text-lg py-6"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <HandHeart className="h-5 w-5 mr-2" />
                      Donate R{(finalAmount || 0).toFixed(2)}
                      {recurring ? ` / ${recurringPeriod}` : ""}
                    </>
                  )}
                </Button>

                <p className="text-xs text-arrc-500 text-center mt-3">
                  {paymentMethod === "eft"
                    ? "You'll receive bank details to complete your EFT after submitting."
                    : "Secure card payment — you'll be redirected to complete your payment."}
                </p>
              </CardContent>
            </Card>

            {/* Bank Details Quick Reference */}
            <Card className="bg-arrc-950 text-white border-arrc-800 mt-4">
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-arrc-gold mb-3 flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4" /> Quick EFT Reference
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <span className="text-white/50">Bank:</span>
                  <span>{bankDetails.bank}</span>
                  <span className="text-white/50">Account:</span>
                  <span>{bankDetails.accountName}</span>
                  <span className="text-white/50">Acc No:</span>
                  <span className="font-mono">{bankDetails.accountNumber}</span>
                  <span className="text-white/50">Branch:</span>
                  <span className="font-mono">{bankDetails.branchCode}</span>
                </div>
                <p className="text-xs text-white/40 mt-3">
                  Use your donation reference as the payment reference for faster processing.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Why Donate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-3"
        >
          {[
            { icon: TrendingUp, title: "Transparent Spending", desc: "Every rand is tracked and reported. See exactly where your money goes." },
            { icon: Users, title: "Community Impact", desc: "Your donation directly funds community projects and policy advocacy." },
            { icon: Shield, title: "Secure & POPIA Compliant", desc: "Your information is protected under South African privacy law." },
          ].map((item, i) => (
            <Card key={i} className="bg-white border-arrc-200">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-arrc-gold/10 flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-arrc-gold" />
                </div>
                <h3 className="font-heading font-bold text-arrc-950 mb-2">{item.title}</h3>
                <p className="text-sm text-arrc-600">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
