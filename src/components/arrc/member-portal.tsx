"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  LogIn,
  RefreshCw,
  AlertCircle,
  BadgeCheck,
  IdCard,
} from "lucide-react";
import { MembershipCardCanvas } from "@/components/arrc/membership-card-canvas";

interface MemberInfo {
  id: string;
  memberId: string | null;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  province: string;
  occupation: string | null;
  wardBranch: string | null;
  address: string | null;
  paymentStatus: string;
  membershipStatus: string;
  createdAt: string;
}

interface CardInfo {
  cardNumber: string;
  status: string;
  cardType: string;
  issueDate: string;
  expiryDate: string | null;
  memberName: string;
  memberSurname: string;
  memberGender: string;
  memberDateOfBirth: string | null;
  memberIdNumber: string | null;
  memberProvince: string;
  memberWardBranch: string | null;
  memberOccupation: string | null;
  memberEmail: string | null;
  memberPhone: string | null;
  memberAddress: string | null;
  memberSelfieUrl: string | null;
}

export function MemberPortal() {
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [card, setCard] = useState<CardInfo | null>(null);

  const [renewing, setRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(false);
  const [renewError, setRenewError] = useState("");

  const handleLookup = async () => {
    setError("");
    if (!idNumber || !email) {
      setError("Please enter both your ID number and email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/member/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNumber, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Member not found.");
        return;
      }

      setMember(data.member);
      setCard(data.card);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    setRenewError("");
    setRenewing(true);
    try {
      const res = await fetch("/api/member/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNumber, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRenewError(data.error || "Failed to renew membership.");
        return;
      }

      setRenewSuccess(true);
      // Update card info
      if (data.card) {
        setCard({
          ...card!,
          status: data.card.status,
          issueDate: data.card.issueDate,
          expiryDate: data.card.expiryDate,
        });
      }
      // Update member status
      if (member) {
        setMember({ ...member, membershipStatus: "active", paymentStatus: "confirmed" });
      }
    } catch {
      setRenewError("Network error. Please try again.");
    } finally {
      setRenewing(false);
    }
  };

  const handleLogout = () => {
    setMember(null);
    setCard(null);
    setIdNumber("");
    setEmail("");
    setRenewSuccess(false);
    setError("");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isCardExpired = card?.status === "expired" || (card?.expiryDate && new Date(card.expiryDate) < new Date());

  /* ─── LOGIN VIEW ─── */
  if (!member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white border-arrc-200 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-arrc-gold/10 mb-4">
                  <LogIn className="h-8 w-8 text-arrc-gold" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-arrc-950 mb-2">
                  Member Portal
                </h2>
                <p className="text-sm text-arrc-600">
                  Check your membership status, view your card, and renew your membership.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="portal-id" className="text-sm text-arrc-700 mb-1.5 block">
                    ID Number *
                  </Label>
                  <Input
                    id="portal-id"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="13-digit SA ID number"
                    maxLength={13}
                    className="border-arrc-200 focus:border-arrc-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="portal-email" className="text-sm text-arrc-700 mb-1.5 block">
                    Email Address *
                  </Label>
                  <Input
                    id="portal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="The email you registered with"
                    className="border-arrc-200 focus:border-arrc-gold"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleLookup}
                  disabled={loading}
                  className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold py-5"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="h-5 w-5 mr-2" />
                  )}
                  {loading ? "Checking..." : "Check My Membership"}
                </Button>

                <p className="text-xs text-arrc-500 text-center">
                  Use the ID number and email you registered with. If you&apos;re having trouble,
                  contact us at info@arrc.co.za
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ─── LOGGED IN VIEW ─── */
  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-arrc-950">
              Welcome, {member.firstName}!
            </h1>
            <p className="text-arrc-600 mt-1">
              Member ID: <span className="font-mono font-semibold text-arrc-950">{member.memberId || "N/A"}</span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-arrc-200 text-arrc-600"
          >
            <LogIn className="h-4 w-4 mr-2 rotate-180" /> Exit Portal
          </Button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Membership Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white border-arrc-200 h-full">
              <CardContent className="p-6">
                <h2 className="font-heading font-bold text-arrc-950 mb-4 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-arrc-gold" />
                  Membership Status
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-arrc-50">
                    <span className="text-sm text-arrc-600">Status:</span>
                    <StatusBadge status={member.membershipStatus} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-arrc-50">
                    <span className="text-sm text-arrc-600">Payment:</span>
                    <PaymentBadge status={member.paymentStatus} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-arrc-50">
                    <span className="text-sm text-arrc-600">Member Since:</span>
                    <span className="text-sm font-medium text-arrc-950">
                      {formatDate(member.createdAt)}
                    </span>
                  </div>

                  {member.wardBranch && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-arrc-50">
                      <span className="text-sm text-arrc-600">Ward/Branch:</span>
                      <span className="text-sm font-medium text-arrc-950">{member.wardBranch}</span>
                    </div>
                  )}
                </div>

                {/* Renewal Section */}
                {renewSuccess ? (
                  <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-heading font-bold text-green-800">Membership Renewed!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your membership is now active until{" "}
                      <strong>{card?.expiryDate ? formatDate(card.expiryDate) : "next year"}</strong>.
                    </p>
                  </div>
                ) : isCardExpired ? (
                  <div className="mt-6">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-3">
                      <p className="text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        Your membership card has expired. Renew now to keep your membership active.
                      </p>
                    </div>
                    {renewError && (
                      <p className="text-xs text-red-600 mb-2">{renewError}</p>
                    )}
                    <Button
                      onClick={handleRenew}
                      disabled={renewing}
                      className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-heading font-bold"
                    >
                      {renewing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {renewing ? "Renewing..." : "Renew Membership (R20 / 1 Year)"}
                    </Button>
                  </div>
                ) : card ? (
                  <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Your membership is active until{" "}
                      <strong>{card.expiryDate ? formatDate(card.expiryDate) : "N/A"}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg bg-arrc-50 border border-arrc-200 p-4">
                    <p className="text-sm text-arrc-600">
                      No membership card found. Please contact the ARRC office to have your card generated.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Membership Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white border-arrc-200 h-full">
              <CardContent className="p-6">
                <h2 className="font-heading font-bold text-arrc-950 mb-4 flex items-center gap-2">
                  <IdCard className="h-5 w-5 text-arrc-gold" />
                  Membership Card
                </h2>

                {card ? (
                  <div>
                    {/* Status Banner */}
                    {isCardExpired ? (
                      <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <p className="text-xs text-red-700">
                          Your membership card has expired. Renew now to keep your membership active.
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <p className="text-xs text-green-700">
                          Your membership card is active. Expires on{" "}
                          <strong>{card.expiryDate ? formatDate(card.expiryDate) : "N/A"}</strong>.
                        </p>
                      </div>
                    )}

                    {/* Professional Card Canvas with Front + Back, Logo, and Selfie */}
                    <MembershipCardCanvas
                      member={{
                        firstName: card.memberName,
                        lastName: card.memberSurname,
                        memberId: card.cardNumber,
                        gender: card.memberGender || "",
                        dateOfBirth: card.memberDateOfBirth || "",
                        idNumber: card.memberIdNumber || "",
                        province: card.memberProvince,
                        wardBranch: card.memberWardBranch || "",
                        occupation: card.memberOccupation || "",
                        email: card.memberEmail || "",
                        phone: card.memberPhone || "",
                        address: card.memberAddress || "",
                        cardNumber: card.cardNumber,
                        cardType: card.cardType,
                        issueDate: card.issueDate ? new Date(card.issueDate).toLocaleDateString() : "",
                        expiryDate: card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : "",
                        selfieUrl: card.memberSelfieUrl,
                        status: card.status,
                      }}
                    />

                    <p className="text-xs text-arrc-500 text-center mt-3">
                      Valid for 1 year • Must be renewed annually • Use the flip button to view the back
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-arrc-100 flex items-center justify-center mb-3">
                      <IdCard className="h-8 w-8 text-arrc-400" />
                    </div>
                    <p className="text-sm text-arrc-600">
                      No membership card has been generated yet.
                    </p>
                    <p className="text-xs text-arrc-400 mt-1">
                      Contact the ARRC office to request your card.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="bg-white border-arrc-200">
            <CardContent className="p-6">
              <h2 className="font-heading font-bold text-arrc-950 mb-4">
                Personal Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem icon={User} label="Full Name" value={`${member.firstName} ${member.lastName}`} />
                <InfoItem icon={Mail} label="Email" value={member.email} />
                <InfoItem icon={Phone} label="Phone" value={member.phone} />
                <InfoItem icon={Calendar} label="Date of Birth" value={member.dateOfBirth} />
                <InfoItem icon={MapPin} label="Province" value={member.province} />
                {member.occupation && (
                  <InfoItem icon={BadgeCheck} label="Occupation" value={member.occupation} />
                )}
                {member.address && (
                  <InfoItem icon={MapPin} label="Address" value={member.address} />
                )}
                <InfoItem icon={CreditCard} label="ID Number" value={member.idNumber} />
              </div>
              <p className="text-xs text-arrc-400 mt-4">
                To update your information, please contact the ARRC office at info@arrc.co.za
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */
function StatusBadge({ status, dark }: { status: string; dark?: boolean }) {
  const config: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    active: { color: dark ? "text-green-400" : "text-green-700 bg-green-100", icon: CheckCircle2 },
    pending: { color: dark ? "text-yellow-400" : "text-yellow-700 bg-yellow-100", icon: Clock },
    expired: { color: dark ? "text-red-400" : "text-red-700 bg-red-100", icon: XCircle },
    suspended: { color: dark ? "text-red-400" : "text-red-700 bg-red-100", icon: XCircle },
    revoked: { color: dark ? "text-red-400" : "text-red-700 bg-red-100", icon: XCircle },
  };

  const c = config[status] || config.pending;
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    confirmed: "text-green-700 bg-green-100",
    pending: "text-yellow-700 bg-yellow-100",
    failed: "text-red-700 bg-red-100",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config[status] || config.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-arrc-gold/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-arrc-gold" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-arrc-500">{label}</p>
        <p className="text-sm font-medium text-arrc-950 truncate">{value}</p>
      </div>
    </div>
  );
}
