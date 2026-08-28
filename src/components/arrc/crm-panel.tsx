"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  LogIn,
  LogOut,
  Users,
  UserCheck,
  Clock,
  Ban,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  IdCard,
  Shield,
  Crown,
  Eye,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  FileDown,
  MapPin,
  TrendingUp,
  Database,
  ExternalLink,
  UserPlus,
  Plus,
  CreditCardIcon,
  Printer,
  FileText,
  RefreshCw,
  Filter,
  UserCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CRMContentPanel } from "@/components/arrc/crm-content-panel";
import { MembershipCardCanvas } from "@/components/arrc/membership-card-canvas";

/* ─── Types ─── */
interface AdminInfo {
  username: string;
  displayName: string | null;
}

interface MemberRecord {
  id: string;
  memberId: string | null;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string | null;
  province: string;
  occupation: string | null;
  wardBranch: string | null;
  paymentMethod: string;
  paymentStatus: string;
  membershipStatus: string;
  cardGenerated: boolean;
  selfieUrl: string | null;
  proofOfPaymentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CardRecord {
  id: string;
  cardNumber: string;
  memberId: string;
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
  status: string;
  cardType: string;
  issueDate: string;
  expiryDate: string | null;
  generatedBy: string | null;
  notes: string | null;
  selfieUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  suspendedMembers: number;
  expiredMembers: number;
  paymentConfirmed: number;
  paymentPending: number;
  provinceBreakdown: { province: string; count: number }[];
  recentMembers: MemberRecord[];
  totalVolunteers: number;
  totalDonations: number;
}

/* ─── Status helpers ─── */
function statusColor(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-700 border-green-200";
    case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "suspended": return "bg-red-100 text-red-700 border-red-200";
    case "expired": return "bg-gray-100 text-gray-600 border-gray-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function paymentColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-green-100 text-green-700 border-green-200";
    case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "failed": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function cardStatusColor(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-700 border-green-200";
    case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "expired": return "bg-gray-100 text-gray-600 border-gray-200";
    case "revoked": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function cardTypeColor(type: string) {
  switch (type) {
    case "standard": return "bg-gray-100 text-gray-700 border-gray-200";
    case "premium": return "bg-arrc-gold/10 text-arrc-gold border-arrc-gold/20";
    case "honorary": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

/* ─── Setup Screen (when Supabase not configured) ─── */
function SetupScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-arrc-950 via-arrc-900 to-arrc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-arrc-gold/10 border border-arrc-gold/20">
            <Database className="h-8 w-8 text-arrc-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white">Database Setup Required</h1>
          <p className="text-white/50 text-sm mt-1">Connect Supabase to access the CRM</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 space-y-4">
          <p className="text-white/70 text-sm leading-relaxed">
            The ARRC CRM requires a <strong className="text-arrc-gold">Supabase</strong> database to store member data.
            Follow these steps to set it up:
          </p>

          <ol className="space-y-3 text-sm text-white/70">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-arrc-gold/20 text-arrc-gold text-xs font-bold shrink-0">1</span>
              <span>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-arrc-gold underline">supabase.com</a> and create a free account</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-arrc-gold/20 text-arrc-gold text-xs font-bold shrink-0">2</span>
              <span>Create a new project (free tier is fine)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-arrc-gold/20 text-arrc-gold text-xs font-bold shrink-0">3</span>
              <span>Go to <strong>SQL Editor</strong> and run the schema from <code className="bg-white/10 px-1.5 py-0.5 rounded text-arrc-gold">supabase-schema.sql</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-arrc-gold/20 text-arrc-gold text-xs font-bold shrink-0">4</span>
              <span>Go to <strong>Settings → API</strong> and copy the Project URL, anon key, and service role key</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-arrc-gold/20 text-arrc-gold text-xs font-bold shrink-0">5</span>
              <span>Add them as environment variables (see <code className="bg-white/10 px-1.5 py-0.5 rounded text-arrc-gold">.env.example</code>)</span>
            </li>
          </ol>

          <div className="pt-2 border-t border-white/10">
            <p className="text-[11px] text-white/30">
              Contact your administrator for CRM login credentials
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          African Royal Rainbow Congress &bull; CRM System
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Login Screen ─── */
function LoginScreen({ onLogin }: { onLogin: (token: string, admin: AdminInfo) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token, data.admin);
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error — is the database configured?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-arrc-950 via-arrc-900 to-arrc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-arrc-gold/10 border border-arrc-gold/20 overflow-hidden">
            <Image src="/logo.jpg" alt="ARRC" width={48} height={48} className="rounded-xl object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white">ARRC CRM</h1>
          <p className="text-white/50 text-sm mt-1">Membership Management System</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold h-11"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block h-4 w-4 border-2 border-arrc-950/30 border-t-arrc-950 rounded-full"
                  />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          African Royal Rainbow Congress &bull; Authorized Access Only
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Dashboard ─── */
function Dashboard({ stats, isLoading }: { stats: DashboardStats | null; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white border border-gray-100 p-5 animate-pulse">
            <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Members", value: stats.totalMembers, icon: Users, color: "text-arrc-800 bg-arrc-100" },
    { label: "Active", value: stats.activeMembers, icon: UserCheck, color: "text-green-700 bg-green-100" },
    { label: "Pending", value: stats.pendingMembers, icon: Clock, color: "text-yellow-700 bg-yellow-100" },
    { label: "Suspended", value: stats.suspendedMembers, icon: Ban, color: "text-red-700 bg-red-100" },
    { label: "Payment Confirmed", value: stats.paymentConfirmed, icon: CheckCircle2, color: "text-green-700 bg-green-100" },
    { label: "Payment Pending", value: stats.paymentPending, icon: CreditCard, color: "text-yellow-700 bg-yellow-100" },
    { label: "Volunteers", value: stats.totalVolunteers, icon: TrendingUp, color: "text-arrc-800 bg-arrc-100" },
    { label: "Donations", value: stats.totalDonations, icon: Crown, color: "text-arrc-gold bg-arrc-gold/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-arrc-950">{(card.value ?? 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Province breakdown */}
      {stats.provinceBreakdown.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-100 p-6">
          <h3 className="font-bold text-arrc-950 mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-arrc-gold" />
            Members by Province
          </h3>
          <div className="space-y-2">
            {stats.provinceBreakdown.map((p) => {
              const pct = stats.totalMembers > 0 ? (p.count / stats.totalMembers) * 100 : 0;
              return (
                <div key={p.province} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 truncate">{p.province}</span>
                  <div className="flex-1 h-6 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-arrc-800 to-arrc-gold rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-arrc-950 w-10 text-right">{p.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent members */}
      {stats.recentMembers.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-100 p-6">
          <h3 className="font-bold text-arrc-950 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-arrc-gold" />
            Recent Sign-ups
          </h3>
          <div className="space-y-3">
            {stats.recentMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-arrc-950">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-gray-500">{m.email} &bull; {m.province}</p>
                </div>
                <Badge variant="outline" className={statusColor(m.membershipStatus)}>
                  {m.membershipStatus}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Member Detail Dialog ─── */
function MemberDetailDialog({
  member,
  open,
  onOpenChange,
  onRefresh,
  token,
  initialShowCard = false,
  initialGeneratedMemberId = "",
}: {
  member: MemberRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
  token: string;
  initialShowCard?: boolean;
  initialGeneratedMemberId?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [cardGenerating, setCardGenerating] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [generatedMemberId, setGeneratedMemberId] = useState("");
  const [detailError, setDetailError] = useState("");
  const [selfieUploading, setSelfieUploading] = useState(false);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Track member ID to reset state only when switching members (not on refresh)
  const [lastMemberId, setLastMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      // Only reset card/edit state when switching to a DIFFERENT member
      // This prevents the card from disappearing after generation triggers a refresh
      if (member.id !== lastMemberId) {
        setNotes(member.notes || "");
        setMembershipStatus(member.membershipStatus);
        setPaymentStatus(member.paymentStatus);
        setEditing(false);
        setShowCard(initialShowCard);
        setGeneratedMemberId(initialGeneratedMemberId);
        setDetailError("");
        setLastMemberId(member.id);
      } else {
        // Same member refreshed — just update status fields, don't reset card view
        setNotes(member.notes || "");
        setMembershipStatus(member.membershipStatus);
        setPaymentStatus(member.paymentStatus);
      }
    }
  }, [member, lastMemberId, initialShowCard, initialGeneratedMemberId]);

  if (!member) return null;

  const handleSave = async () => {
    setSaving(true);
    setDetailError("");
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes, membershipStatus, paymentStatus }),
      });
      if (res.ok) {
        setEditing(false);
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setDetailError(data.error || "Failed to save changes.");
      }
    } catch {
      setDetailError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCard = async () => {
    setCardGenerating(true);
    setDetailError("");
    try {
      const res = await fetch(`/api/admin/members/${member.id}/card`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.memberId) {
        setGeneratedMemberId(data.memberId);
        setShowCard(true);
        onRefresh();
      } else {
        setDetailError(data.error || "Failed to generate card. Please try again.");
      }
    } catch {
      setDetailError("Network error. Please check your connection.");
    } finally {
      setCardGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${member.firstName} ${member.lastName}? This cannot be undone.`)) return;
    setDetailError("");
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onOpenChange(false);
        onRefresh();
      } else {
        setDetailError("Failed to delete member.");
      }
    } catch {
      setDetailError("Network error. Please try again.");
    }
  };

  const displayMemberId = generatedMemberId || member.memberId || "—";

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;
    setSelfieUploading(true);
    setDetailError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberId", member.id);
      const res = await fetch("/api/admin/members/upload-selfie", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setDetailError(data.error || "Failed to upload selfie.");
      }
    } catch {
      setDetailError("Network error. Please try again.");
    } finally {
      setSelfieUploading(false);
      // Reset the file input so the same file can be re-selected
      if (selfieInputRef.current) selfieInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-arrc-950 flex items-center gap-2">
            <Shield className="h-5 w-5 text-arrc-gold" />
            Member Details
          </DialogTitle>
          <DialogDescription>
            View and manage member information
          </DialogDescription>
        </DialogHeader>

        {detailError && (
          <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg p-3 border border-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {detailError}
          </div>
        )}

        {showCard ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <MembershipCardCanvas
              member={{
                firstName: member.firstName,
                lastName: member.lastName,
                memberId: displayMemberId,
                gender: member.gender,
                dateOfBirth: member.dateOfBirth,
                idNumber: member.idNumber,
                province: member.province,
                wardBranch: member.wardBranch || "",
                occupation: member.occupation || "",
                email: member.email,
                phone: member.phone,
                address: member.address || "",
                cardNumber: card?.cardNumber || "",
                cardType: card?.cardType || "standard",
                issueDate: card?.issueDate ? new Date(card.issueDate).toLocaleDateString() : new Date().toLocaleDateString(),
                expiryDate: card?.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : "",
                selfieUrl: member.selfieUrl,
                status: card?.status || "active",
              }}
            />
            <Button
              variant="outline"
              onClick={() => setShowCard(false)}
              className="w-full"
            >
              Back to Details
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Hidden file input for selfie upload */}
            <input
              type="file"
              ref={selfieInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleSelfieUpload}
            />

            {/* Selfie display area */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                {member.selfieUrl ? (
                  <img
                    src={member.selfieUrl}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="h-[200px] w-[200px] rounded-2xl object-cover border-2 border-arrc-gold shadow-md"
                  />
                ) : (
                  <div className="h-[200px] w-[200px] rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2">
                    <UserCircle className="h-16 w-16 text-gray-300" />
                    <span className="text-xs text-gray-400">No photo</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selfieUploading}
                  onClick={() => selfieInputRef.current?.click()}
                  className="gap-1.5 text-arrc-gold border-arrc-gold/30 hover:bg-arrc-gold/10"
                >
                  {selfieUploading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block h-3.5 w-3.5 border-2 border-arrc-gold/30 border-t-arrc-gold rounded-full"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-3.5 w-3.5" />
                      {member.selfieUrl ? "Change Photo" : "Upload Photo"}
                    </>
                  )}
                </Button>
                {/* Proof of payment link */}
                {member.proofOfPaymentUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-1.5 text-arrc-gold border-arrc-gold/30 hover:bg-arrc-gold/10"
                  >
                    <a href={member.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Proof of Payment
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={statusColor(membershipStatus)}>
                {membershipStatus}
              </Badge>
              <Badge variant="outline" className={paymentColor(paymentStatus)}>
                Payment: {paymentStatus}
              </Badge>
              {member.cardGenerated && (
                <Badge className="bg-arrc-gold/10 text-arrc-gold border border-arrc-gold/20">
                  <IdCard className="h-3 w-3 mr-1" />
                  Card Issued
                </Badge>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-gray-500">Member ID:</span> <span className="font-mono font-bold text-arrc-gold">{displayMemberId}</span></div>
              <div><span className="text-gray-500">Name:</span> <span className="font-semibold">{member.firstName} {member.lastName}</span></div>
              <div><span className="text-gray-500">ID Number:</span> {member.idNumber}</div>
              <div><span className="text-gray-500">Email:</span> {member.email}</div>
              <div><span className="text-gray-500">Phone:</span> {member.phone}</div>
              <div><span className="text-gray-500">Gender:</span> {member.gender}</div>
              <div><span className="text-gray-500">DOB:</span> {member.dateOfBirth}</div>
              <div><span className="text-gray-500">Province:</span> {member.province}</div>
              <div><span className="text-gray-500">Occupation:</span> {member.occupation || "—"}</div>
              <div><span className="text-gray-500">Ward/Branch:</span> {member.wardBranch || "—"}</div>
              <div className="sm:col-span-2"><span className="text-gray-500">Address:</span> {member.address || "—"}</div>
              <div><span className="text-gray-500">Payment Method:</span> {member.paymentMethod}</div>
              <div><span className="text-gray-500">Registered:</span> {new Date(member.createdAt).toLocaleDateString()}</div>
            </div>

            {editing ? (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Membership Status</Label>
                    <Select value={membershipStatus} onValueChange={setMembershipStatus}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Payment Status</Label>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Admin Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="text-sm" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm" className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                {member.notes && (
                  <div className="bg-arrc-50 rounded-lg p-3 text-sm border border-arrc-100">
                    <span className="text-gray-500 text-xs">Notes:</span> {member.notes}
                  </div>
                )}
              </>
            )}

            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleGenerateCard}
                disabled={cardGenerating}
                className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90"
              >
                <IdCard className="h-3.5 w-3.5 mr-1.5" />
                {cardGenerating ? "Generating..." : member.cardGenerated ? "Regenerate Card" : "Generate Card"}
              </Button>
              <span className="text-[10px] text-gray-400 self-center">Valid for 1 year • Annual renewal required</span>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50 border-red-200">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Add Member Dialog ─── */
function AddMemberDialog({
  open,
  onOpenChange,
  token,
  onMemberAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  onMemberAdded: () => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    province: "",
    occupation: "",
    wardBranch: "",
    paymentMethod: "branch",
    paymentStatus: "pending",
    membershipStatus: "active",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
  ];

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validate required fields
    if (!form.firstName || !form.lastName || !form.idNumber || !form.email || !form.phone || !form.dateOfBirth || !form.gender || !form.province) {
      setError("Please fill in all required fields (First Name, Last Name, ID Number, Email, Phone, Date of Birth, Gender, Province)");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/members/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          members: [{
            firstName: form.firstName,
            lastName: form.lastName,
            idNumber: form.idNumber,
            email: form.email,
            phone: form.phone,
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            address: form.address || undefined,
            province: form.province,
            occupation: form.occupation || undefined,
            wardBranch: form.wardBranch || undefined,
            paymentMethod: form.paymentMethod,
            paymentStatus: form.paymentStatus,
            membershipStatus: form.membershipStatus,
            notes: form.notes || undefined,
          }],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.created > 0) {
          setSuccess(true);
          onMemberAdded();
          // Reset form after a short delay
          setTimeout(() => {
            setForm({
              firstName: "", lastName: "", idNumber: "", email: "", phone: "",
              dateOfBirth: "", gender: "", address: "", province: "",
              occupation: "", wardBranch: "", paymentMethod: "branch",
              paymentStatus: "pending", membershipStatus: "active", notes: "",
            });
            setSuccess(false);
            onOpenChange(false);
          }, 1500);
        } else if (data.skipped > 0) {
          setError("Member with this ID number or email already exists.");
        } else if (data.errors && data.errors.length > 0) {
          setError(data.errors[0]);
        }
      } else {
        setError(data.error || "Failed to add member. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-arrc-950 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-arrc-gold" />
            Add New Member
          </DialogTitle>
          <DialogDescription>
            Register a new ARRC member. Fields marked * are required.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-arrc-950">Member Added Successfully!</h3>
            <p className="text-sm text-gray-500 mt-1">{form.firstName} {form.lastName} has been registered.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg p-3 border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Name */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">First Name *</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  className="border-gray-200 focus:border-arrc-gold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Last Name *</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  className="border-gray-200 focus:border-arrc-gold"
                  required
                />
              </div>
            </div>

            {/* ID Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">ID Number (13 digits) *</Label>
              <Input
                value={form.idNumber}
                onChange={(e) => handleChange("idNumber", e.target.value.replace(/\D/g, "").slice(0, 13))}
                placeholder="e.g. 9001015800081"
                maxLength={13}
                className="border-gray-200 focus:border-arrc-gold"
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="member@email.com"
                  className="border-gray-200 focus:border-arrc-gold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone *</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="e.g. 071 234 5678"
                  className="border-gray-200 focus:border-arrc-gold"
                  required
                />
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date of Birth *</Label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="border-gray-200 focus:border-arrc-gold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Gender *</Label>
                <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}>
                  <SelectTrigger className="border-gray-200 focus:border-arrc-gold">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Province */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Province *</Label>
              <Select value={form.province} onValueChange={(v) => handleChange("province", v)}>
                <SelectTrigger className="border-gray-200 focus:border-arrc-gold">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Address</Label>
              <Input
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address, suburb, city"
                className="border-gray-200 focus:border-arrc-gold"
              />
            </div>

            {/* Occupation & Ward */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Occupation</Label>
                <Input
                  value={form.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  placeholder="e.g. Teacher, Student"
                  className="border-gray-200 focus:border-arrc-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Ward / Branch</Label>
                <Input
                  value={form.wardBranch}
                  onChange={(e) => handleChange("wardBranch", e.target.value)}
                  placeholder="e.g. Ward 12"
                  className="border-gray-200 focus:border-arrc-gold"
                />
              </div>
            </div>

            {/* Payment Method, Payment Status, Membership Status */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => handleChange("paymentMethod", v)}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch">At Branch</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Status</Label>
                <Select value={form.paymentStatus} onValueChange={(v) => handleChange("paymentStatus", v)}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Membership Status</Label>
                <Select value={form.membershipStatus} onValueChange={(v) => handleChange("membershipStatus", v)}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Admin Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Optional notes about this member"
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold h-11"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-4 w-4 border-2 border-arrc-950/30 border-t-arrc-950 rounded-full"
                    />
                    Adding Member...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Members Table ─── */
function MembersTable({
  token,
  onMemberClick,
  onAddMember,
  onGenerateCard,
  refreshKey,
}: {
  token: string;
  onMemberClick: (member: MemberRecord) => void;
  onAddMember: () => void;
  onGenerateCard: (member: MemberRecord) => void;
  refreshKey: number;
}) {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(provinceFilter && { province: provinceFilter }),
      });
      const res = await fetch(`/api/admin/members?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter, provinceFilter, refreshKey]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleProvinceFilter = (value: string) => {
    setProvinceFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "arrc-members.csv";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // ignore
    }
  };

  const provinces = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, email, ID, member ID..."
            className="pl-10 border-gray-200 focus:border-arrc-gold"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={provinceFilter || "all"} onValueChange={handleProvinceFilter}>
          <SelectTrigger className="w-full sm:w-44 border-gray-200">
            <SelectValue placeholder="Province" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Provinces</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport} className="gap-2 border-gray-200">
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
        <Button onClick={onAddMember} className="gap-2 bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <p className="text-sm text-gray-500">{total} member{total !== 1 ? "s" : ""} found</p>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Photo</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Member ID</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Name</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Province</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Payment</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Card</th>
                <th className="text-left p-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="p-3"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-50 hover:bg-arrc-50/30 transition-colors"
                  >
                    <td className="p-3 cursor-pointer" onClick={() => onMemberClick(m)}>
                      {m.selfieUrl ? (
                        <img
                          src={m.selfieUrl}
                          alt={`${m.firstName} ${m.lastName}`}
                          className="h-8 w-8 rounded-full object-cover border border-arrc-gold/30"
                        />
                      ) : (
                        <UserCircle className="h-8 w-8 text-gray-300" />
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs text-arrc-gold font-bold cursor-pointer" onClick={() => onMemberClick(m)}>{m.memberId || "—"}</td>
                    <td className="p-3 cursor-pointer" onClick={() => onMemberClick(m)}>
                      <div className="font-medium text-arrc-950">{m.firstName} {m.lastName}</div>
                      <div className="text-xs text-gray-400 md:hidden">{m.email}</div>
                    </td>
                    <td className="p-3 text-gray-600 hidden md:table-cell cursor-pointer" onClick={() => onMemberClick(m)}>{m.email}</td>
                    <td className="p-3 text-gray-600 hidden lg:table-cell cursor-pointer" onClick={() => onMemberClick(m)}>{m.province}</td>
                    <td className="p-3 cursor-pointer" onClick={() => onMemberClick(m)}>
                      <Badge variant="outline" className={`text-[10px] ${statusColor(m.membershipStatus)}`}>
                        {m.membershipStatus}
                      </Badge>
                    </td>
                    <td className="p-3 hidden sm:table-cell cursor-pointer" onClick={() => onMemberClick(m)}>
                      <Badge variant="outline" className={`text-[10px] ${paymentColor(m.paymentStatus)}`}>
                        {m.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {m.cardGenerated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300" />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onGenerateCard(m)}
                          className="h-7 px-2 text-arrc-gold hover:bg-arrc-gold/10"
                          title="Generate Card"
                        >
                          <IdCard className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMemberClick(m)}
                          className="h-7 px-2 text-gray-500 hover:text-arrc-950"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Cards Panel ─── */
function CardsPanel({
  token,
  onMemberClick,
  refreshKey,
}: {
  token: string;
  onMemberClick: (member: MemberRecord) => void;
  refreshKey: number;
}) {
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cardTypeFilter, setCardTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create card dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [newCardType, setNewCardType] = useState("standard");
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Preview dialog state
  const [previewCard, setPreviewCard] = useState<CardRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Batch generate state
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  // Error state
  const [cardError, setCardError] = useState("");

  // Revoking state
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Renewing state
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const CARDS_PER_PAGE = 12;

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: CARDS_PER_PAGE.toString(),
      });
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/cards?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCards(data.cards || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, refreshKey, page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, cardTypeFilter, searchQuery]);

  // Fetch members for create dialog
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await fetch("/api/admin/members?page=1&limit=200", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
      }
    } catch {
      // ignore
    } finally {
      setMembersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (createOpen) fetchMembers();
  }, [createOpen, fetchMembers]);

  // Computed stats
  const activeCards = cards.filter((c) => c.status === "active").length;
  const expiredCards = cards.filter((c) => c.status === "expired").length;
  const pendingCards = cards.filter((c) => c.status === "pending").length;

  // Filter cards by card type (client-side)
  const filteredCards = cardTypeFilter === "all"
    ? cards
    : cards.filter((c) => c.cardType === cardTypeFilter);

  // Members without cards (for batch generate)
  const membersWithoutCards = members.filter(
    (m) => !cards.some((c) => c.memberId === m.id && c.status === "active")
  );

  const handleCreateCard = async () => {
    if (!selectedMemberId) {
      setCreateError("Please select a member");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: selectedMemberId,
          cardType: newCardType,
          expiryDate: newExpiryDate || undefined,
          notes: newNotes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        setSelectedMemberId("");
        setNewCardType("standard");
        setNewExpiryDate("");
        setNewNotes("");
        fetchCards();
      } else {
        setCreateError(data.error || "Failed to create card");
      }
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeCard = async (cardId: string) => {
    if (!confirm("Revoke this membership card? The member will no longer have an active card.")) return;
    setRevokingId(cardId);
    setCardError("");
    try {
      const res = await fetch(`/api/admin/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "revoked" }),
      });
      if (res.ok) {
        fetchCards();
      } else {
        const data = await res.json().catch(() => ({}));
        setCardError(data.error || "Failed to revoke card");
      }
    } catch {
      setCardError("Network error. Please try again.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Delete this membership card? This cannot be undone.")) return;
    setCardError("");
    try {
      const res = await fetch(`/api/admin/cards/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchCards();
      } else {
        const data = await res.json().catch(() => ({}));
        setCardError(data.error || "Failed to delete card");
      }
    } catch {
      setCardError("Network error. Please try again.");
    }
  };

  const handleRenewCard = async (cardId: string) => {
    if (!confirm("Renew this membership card for another year? The card will be reactivated with a new expiry date.")) return;
    setRenewingId(cardId);
    setCardError("");
    try {
      const res = await fetch(`/api/admin/cards/${cardId}/renew`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fetchCards();
      } else {
        setCardError(data.error || "Failed to renew card");
      }
    } catch {
      setCardError("Network error. Please try again.");
    } finally {
      setRenewingId(null);
    }
  };

  const handlePreviewCard = (card: CardRecord) => {
    setPreviewCard(card);
    setPreviewOpen(true);
  };

  const handleBatchGenerate = async () => {
    if (!confirm(`Generate cards for all ${membersWithoutCards.length} members without cards?`)) return;
    setBatchGenerating(true);
    setBatchProgress({ done: 0, total: membersWithoutCards.length });
    setCardError("");

    let errors = 0;
    for (let i = 0; i < membersWithoutCards.length; i++) {
      const m = membersWithoutCards[i];
      try {
        const res = await fetch("/api/admin/cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ memberId: m.id, cardType: "standard" }),
        });
        if (!res.ok) errors++;
      } catch {
        errors++;
      }
      setBatchProgress({ done: i + 1, total: membersWithoutCards.length });
    }

    setBatchGenerating(false);
    fetchCards();
    if (errors > 0) {
      setCardError(`${errors} card(s) could not be generated. Please check and retry.`);
    }
  };

  const handleViewMember = (card: CardRecord) => {
    const member = members.find((m) => m.id === card.memberId);
    if (member) {
      onMemberClick(member);
    }
  };

  // Loading skeleton
  if (loading && cards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-100 p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-1/3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {cardError && (
        <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg p-3 border border-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {cardError}
          <Button variant="ghost" size="sm" className="ml-auto h-6 px-2" onClick={() => setCardError("")}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Statistics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Cards</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-arrc-800 bg-arrc-100">
              <IdCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-arrc-950">{total}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Active</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-green-700 bg-green-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-arrc-950">{activeCards}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Expired</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 bg-gray-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-arrc-950">{expiredCards}</p>
        </div>
        <div className="rounded-xl bg-white border border-arrc-gold/30 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-arrc-gold uppercase tracking-wide">Pending</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-arrc-gold bg-arrc-gold/10">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-arrc-950">{pendingCards}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-xl bg-white border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, card number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-200 focus:border-arrc-gold"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] border-gray-200">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
              <SelectTrigger className="w-[150px] border-gray-200">
                <Crown className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <SelectValue placeholder="Card Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="honorary">Honorary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Card
        </Button>
        <Button
          variant="outline"
          onClick={handleBatchGenerate}
          disabled={batchGenerating || membersWithoutCards.length === 0}
          className="border-arrc-gold/30 text-arrc-gold hover:bg-arrc-gold/10"
        >
          {batchGenerating ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 border-2 border-arrc-gold/30 border-t-arrc-gold rounded-full mr-2"
              />
              Generating {batchProgress.done}/{batchProgress.total}...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Batch Generate ({membersWithoutCards.length})
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => fetchCards()}
          className="border-gray-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="rounded-xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow group"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-arrc-50 text-arrc-800">
                      <IdCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-arrc-950">
                        {card.memberName} {card.memberSurname}
                      </p>
                      <p className="text-xs font-mono text-arrc-gold">{card.cardNumber}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cardStatusColor(card.status)}>
                    {card.status}
                  </Badge>
                </div>

                {/* Card details */}
                <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {card.memberProvince}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Issued: {new Date(card.issueDate).toLocaleDateString()}
                  </div>
                  {card.expiryDate && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Expires: {new Date(card.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Card type badge */}
                <div className="mb-3">
                  <Badge variant="outline" className={cardTypeColor(card.cardType)}>
                    {card.cardType === "premium" && <Crown className="h-3 w-3 mr-1" />}
                    {card.cardType === "honorary" && <Shield className="h-3 w-3 mr-1" />}
                    {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewCard(card)}
                    className="h-8 px-2 text-gray-500 hover:text-arrc-950"
                    title="View Card"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewMember(card)}
                    className="h-8 px-2 text-gray-500 hover:text-arrc-950"
                    title="View Member"
                  >
                    <Users className="h-3.5 w-3.5" />
                  </Button>
                  {card.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeCard(card.id)}
                      disabled={revokingId === card.id}
                      className="h-8 px-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      title="Revoke Card"
                    >
                      {revokingId === card.id ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block h-3.5 w-3.5 border-2 border-yellow-300 border-t-yellow-600 rounded-full"
                        />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                  {(card.status === "revoked" || card.status === "pending") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCard(card.id)}
                      className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete Card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {(card.status === "expired" || card.status === "revoked") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRenewCard(card.id)}
                      disabled={renewingId === card.id}
                      className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Renew Card (1 Year)"
                    >
                      {renewingId === card.id ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block h-3.5 w-3.5 border-2 border-green-300 border-t-green-600 rounded-full"
                        />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <IdCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-500">
            {searchQuery || statusFilter !== "all" || cardTypeFilter !== "all"
              ? "No cards match your filters"
              : "No Membership Cards Yet"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery || statusFilter !== "all" || cardTypeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create cards for members to get started"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create Card Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-arrc-950 flex items-center gap-2">
              <Plus className="h-5 w-5 text-arrc-gold" />
              Create Membership Card
            </DialogTitle>
            <DialogDescription>
              Generate a new membership card for a member
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg p-3 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {createError}
            </div>
          )}

          <div className="space-y-4">
            {/* Member Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Select Member *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members by name..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-9 border-gray-200 focus:border-arrc-gold"
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                {membersLoading ? (
                  <div className="p-4 text-center text-sm text-gray-400">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-4 w-4 border-2 border-gray-200 border-t-arrc-gold rounded-full"
                    />
                    <span className="ml-2">Loading members...</span>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {members
                      .filter((m) => {
                        if (!memberSearch) return true;
                        const q = memberSearch.toLowerCase();
                        return (
                          m.firstName.toLowerCase().includes(q) ||
                          m.lastName.toLowerCase().includes(q) ||
                          m.email.toLowerCase().includes(q) ||
                          (m.memberId && m.memberId.toLowerCase().includes(q))
                        );
                      })
                      .slice(0, 50)
                      .map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMemberId(m.id)}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            selectedMemberId === m.id
                              ? "bg-arrc-gold/10 text-arrc-950"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div>
                            <p className="font-medium">{m.firstName} {m.lastName}</p>
                            <p className="text-xs text-gray-500">{m.memberId || m.email}</p>
                          </div>
                          {selectedMemberId === m.id && (
                            <CheckCircle2 className="h-4 w-4 text-arrc-gold" />
                          )}
                        </button>
                      ))}
                    {members.filter((m) => {
                      if (!memberSearch) return true;
                      const q = memberSearch.toLowerCase();
                      return (
                        m.firstName.toLowerCase().includes(q) ||
                        m.lastName.toLowerCase().includes(q) ||
                        m.email.toLowerCase().includes(q) ||
                        (m.memberId && m.memberId.toLowerCase().includes(q))
                      );
                    }).length === 0 && (
                      <div className="p-3 text-center text-xs text-gray-400">No members found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card Type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Card Type</Label>
              <Select value={newCardType} onValueChange={setNewCardType}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="honorary">Honorary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Expiry Date</Label>
              <Input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="border-gray-200 focus:border-arrc-gold"
              />
              <p className="text-[10px] text-gray-400">Default: 1 year from today if left blank. All cards must be renewed annually.</p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Notes (optional)</Label>
              <Textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Optional notes about this card"
                rows={2}
                className="text-sm border-gray-200 focus:border-arrc-gold"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreateCard}
                disabled={creating || !selectedMemberId}
                className="flex-1 bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold"
              >
                {creating ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-4 w-4 border-2 border-arrc-950/30 border-t-arrc-950 rounded-full mr-2"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <IdCard className="h-4 w-4 mr-2" />
                    Create Card
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setSelectedMemberId("");
                  setNewCardType("standard");
                  setNewExpiryDate("");
                  setNewNotes("");
                  setCreateError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-arrc-950 flex items-center gap-2">
              <IdCard className="h-5 w-5 text-arrc-gold" />
              Card Preview
            </DialogTitle>
            <DialogDescription>
              Membership card details and preview
            </DialogDescription>
          </DialogHeader>

          {previewCard && (
            <div className="space-y-4">
              {/* Card Canvas Preview */}
              <MembershipCardCanvas
                member={{
                  firstName: previewCard.memberName,
                  lastName: previewCard.memberSurname,
                  memberId: previewCard.cardNumber,
                  gender: previewCard.memberGender,
                  dateOfBirth: previewCard.memberDateOfBirth || "",
                  idNumber: previewCard.memberIdNumber || "",
                  province: previewCard.memberProvince,
                  wardBranch: previewCard.memberWardBranch || "",
                  occupation: previewCard.memberOccupation || "",
                  email: previewCard.memberEmail || "",
                  phone: previewCard.memberPhone || "",
                  address: previewCard.memberAddress || "",
                  cardNumber: previewCard.cardNumber,
                  cardType: previewCard.cardType,
                  issueDate: previewCard.issueDate ? new Date(previewCard.issueDate).toLocaleDateString() : "",
                  expiryDate: previewCard.expiryDate ? new Date(previewCard.expiryDate).toLocaleDateString() : "",
                  selfieUrl: previewCard.selfieUrl || null,
                  status: previewCard.status,
                }}
              />

              {/* Card Details */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cardStatusColor(previewCard.status)}>
                    {previewCard.status}
                  </Badge>
                  <Badge variant="outline" className={cardTypeColor(previewCard.cardType)}>
                    {previewCard.cardType === "premium" && <Crown className="h-3 w-3 mr-1" />}
                    {previewCard.cardType === "honorary" && <Shield className="h-3 w-3 mr-1" />}
                    {previewCard.cardType.charAt(0).toUpperCase() + previewCard.cardType.slice(1)}
                  </Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-500">Card Number:</span>{" "}
                    <span className="font-mono font-bold text-arrc-gold">{previewCard.cardNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>{" "}
                    <span className="font-medium">{previewCard.memberGender || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Province:</span>{" "}
                    <span className="font-medium">{previewCard.memberProvince}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ward/Branch:</span>{" "}
                    <span className="font-medium">{previewCard.memberWardBranch || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date of Birth:</span>{" "}
                    <span className="font-medium">{previewCard.memberDateOfBirth || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ID Number:</span>{" "}
                    <span className="font-mono font-medium">{previewCard.memberIdNumber || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Occupation:</span>{" "}
                    <span className="font-medium">{previewCard.memberOccupation || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="font-medium">{previewCard.memberEmail || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>{" "}
                    <span className="font-medium">{previewCard.memberPhone || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Address:</span>{" "}
                    <span className="font-medium">{previewCard.memberAddress || "\u2014"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Issue Date:</span>{" "}
                    {new Date(previewCard.issueDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-500">Expiry Date:</span>{" "}
                    {previewCard.expiryDate
                      ? new Date(previewCard.expiryDate).toLocaleDateString()
                      : `${new Date(new Date(previewCard.issueDate).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()} (1 year from issue)`}
                  </div>
                  {previewCard.generatedBy && (
                    <div>
                      <span className="text-gray-500">Generated By:</span>{" "}
                      {previewCard.generatedBy}
                    </div>
                  )}
                </div>

                {previewCard.notes && (
                  <div className="bg-white rounded-lg p-3 text-sm border border-gray-100">
                    <span className="text-gray-500 text-xs">Notes:</span> {previewCard.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleViewMember(previewCard)}
                  className="flex-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Member
                </Button>
                {previewCard.status === "active" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRevokeCard(previewCard.id);
                      setPreviewOpen(false);
                    }}
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Revoke
                  </Button>
                )}
                {(previewCard.status === "expired" || previewCard.status === "revoked") && (
                  <Button
                    onClick={() => {
                      handleRenewCard(previewCard.id);
                      setPreviewOpen(false);
                    }}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew for 1 Year
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Main CRM Panel ─── */
export function CRMPanel({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "members" | "cards" | "content">("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [dbConfigured, setDbConfigured] = useState<boolean | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [cardAutoShow, setCardAutoShow] = useState(false);
  const [cardAutoMemberId, setCardAutoMemberId] = useState("");

  // Check if database is configured
  useEffect(() => {
    fetch("/api/admin/health").then((res) => {
      setDbConfigured(res.status !== 503);
    }).catch(() => {
      setDbConfigured(false);
    });
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const saved = localStorage.getItem("arrc_crm_token");
    const savedAdmin = localStorage.getItem("arrc_crm_admin");
    if (saved && savedAdmin) {
      fetch("/api/admin/verify", {
        headers: { Authorization: `Bearer ${saved}` },
      }).then((res) => {
        if (res.ok) {
          setToken(saved);
          setAdmin(JSON.parse(savedAdmin));
        } else {
          localStorage.removeItem("arrc_crm_token");
          localStorage.removeItem("arrc_crm_admin");
        }
      });
    }
  }, []);

  // Fetch stats when authenticated or tab changes
  const [statsKey, setStatsKey] = useState(0);
  const [membersKey, setMembersKey] = useState(0);
  useEffect(() => {
    if (!token || activeTab !== "dashboard") return;
    setStatsLoading(true);
    let cancelled = false;
    const loadStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    loadStats();
    return () => { cancelled = true; };
  }, [token, activeTab, statsKey]);

  const handleLogin = (newToken: string, adminInfo: AdminInfo) => {
    setToken(newToken);
    setAdmin(adminInfo);
    localStorage.setItem("arrc_crm_token", newToken);
    localStorage.setItem("arrc_crm_admin", JSON.stringify(adminInfo));
  };

  const handleLogout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("arrc_crm_token");
    localStorage.removeItem("arrc_crm_admin");
  };

  // Not configured
  if (dbConfigured === false) {
    return (
      <div className="fixed inset-0 z-[90]">
        <SetupScreen />
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[91] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>
    );
  }

  // Not authenticated
  if (!token) {
    return (
      <div className="fixed inset-0 z-[90]">
        <LoginScreen onLogin={handleLogin} />
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[91] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>
    );
  }

  const handleMemberClick = (member: MemberRecord) => {
    setSelectedMember(member);
    setCardAutoShow(false);
    setCardAutoMemberId("");
    setDetailOpen(true);
  };

  const handleGenerateCardFromTable = async (member: MemberRecord) => {
    try {
      const res = await fetch(`/api/admin/members/${member.id}/card`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.memberId) {
        setSelectedMember({ ...member, cardGenerated: true, memberId: data.memberId, membershipStatus: "active", paymentStatus: "confirmed" });
        setCardAutoShow(true);
        setCardAutoMemberId(data.memberId);
        setDetailOpen(true);
        refreshData();
      }
    } catch {
      // ignore
    }
  };

  const refreshData = () => {
    setStatsKey((k) => k + 1);
    setMembersKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-gray-50 overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="bg-arrc-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arrc-gold/10 overflow-hidden">
            <Image src="/logo.jpg" alt="ARRC" width={24} height={24} className="rounded object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-sm">ARRC CRM</h1>
            <p className="text-[10px] text-white/40">{admin?.displayName || admin?.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "dashboard" ? "bg-arrc-gold text-arrc-950" : "text-white/60 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 inline mr-1" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "members" ? "bg-arrc-gold text-arrc-950" : "text-white/60 hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5 inline mr-1" />
              Members
            </button>
            <button
              onClick={() => setActiveTab("cards")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "cards" ? "bg-arrc-gold text-arrc-950" : "text-white/60 hover:text-white"
              }`}
            >
              <IdCard className="h-3.5 w-3.5 inline mr-1" />
              Cards
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "content" ? "bg-arrc-gold text-arrc-950" : "text-white/60 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5 inline mr-1" />
              Content
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="sm:hidden flex items-center gap-1 bg-white border-b border-gray-100 p-2">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "dashboard" ? "bg-arrc-950 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 inline mr-1" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "members" ? "bg-arrc-950 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Users className="h-3.5 w-3.5 inline mr-1" />
          Members
        </button>
        <button
          onClick={() => setActiveTab("cards")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "cards" ? "bg-arrc-950 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <IdCard className="h-3.5 w-3.5 inline mr-1" />
          Cards
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "content" ? "bg-arrc-950 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1" />
          Content
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard stats={stats} isLoading={statsLoading} />
            </motion.div>
          ) : activeTab === "members" ? (
            <motion.div
              key="members"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <MembersTable token={token} onMemberClick={handleMemberClick} onAddMember={() => setAddOpen(true)} onGenerateCard={handleGenerateCardFromTable} refreshKey={membersKey} />
            </motion.div>
          ) : activeTab === "cards" ? (
            <motion.div key="cards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <CardsPanel token={token} onMemberClick={handleMemberClick} refreshKey={membersKey} />
            </motion.div>
          ) : activeTab === "content" ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CRMContentPanel token={token} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Member Detail Dialog */}
      <MemberDetailDialog
        member={selectedMember}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            // Reset auto-show state when dialog closes
            setCardAutoShow(false);
            setCardAutoMemberId("");
          }
        }}
        onRefresh={refreshData}
        token={token}
        initialShowCard={cardAutoShow}
        initialGeneratedMemberId={cardAutoMemberId}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        token={token}
        onMemberAdded={refreshData}
      />
    </div>
  );
}
