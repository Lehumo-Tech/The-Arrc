"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Newspaper,
  ScrollText,
  Crown,
  ImageIcon,
  Video,
  HelpCircle,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Star,
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileText,
  Database,
  Copy,
  ExternalLink,
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
import { Switch } from "@/components/ui/switch";

/* ─── Types ─── */
type ContentType = "event" | "news" | "policy" | "leader" | "gallery" | "video" | "faq" | "value" | "document";
type ContentStatus = "draft" | "published" | "archived";

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  category: string | null;
  date: string | null;
  location: string | null;
  status: ContentStatus;
  featured: boolean;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ─── */
const CONTENT_TYPES: { type: ContentType; label: string; icon: typeof Calendar }[] = [
  { type: "event", label: "Events", icon: Calendar },
  { type: "news", label: "News", icon: Newspaper },
  { type: "policy", label: "Policies", icon: ScrollText },
  { type: "leader", label: "Leaders", icon: Crown },
  { type: "gallery", label: "Gallery", icon: ImageIcon },
  { type: "video", label: "Videos", icon: Video },
  { type: "faq", label: "FAQs", icon: HelpCircle },
  { type: "value", label: "Values", icon: Sparkles },
  { type: "document", label: "Documents", icon: FileText },
];

const LUCIDE_ICONS = [
  "Shield", "Scale", "TrendingUp", "Home", "GraduationCap", "HeartPulse",
  "Leaf", "Handshake", "Briefcase", "Crown", "Users", "Globe",
  "BookOpen", "Lightbulb", "Star", "Target", "Zap", "Award", "ShieldCheck", "Gavel",
];

/* ─── Helpers ─── */
function contentStatusColor(status: string) {
  switch (status) {
    case "draft": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "published": return "bg-green-100 text-green-700 border-green-200";
    case "archived": return "bg-gray-100 text-gray-600 border-gray-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

/* ─── Content Edit/Create Dialog ─── */
function ContentEditDialog({
  open,
  onOpenChange,
  token,
  contentType,
  editingItem,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  contentType: ContentType;
  editingItem: ContentItem | null;
  onSaved: () => void;
}) {
  const isEditing = !!editingItem;

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    content: "",
    imageUrl: "",
    category: "",
    date: "",
    location: "",
    status: "draft" as ContentStatus,
    featured: false,
    sortOrder: 0,
    // metadata fields
    icon: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    badge: "",
    bulletsText: "",
    detail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editingItem) {
      const meta = (editingItem.metadata || {}) as Record<string, unknown>;
      setForm({
        title: editingItem.title || "",
        subtitle: editingItem.subtitle || "",
        description: editingItem.description || "",
        content: editingItem.content || "",
        imageUrl: editingItem.imageUrl || "",
        category: editingItem.category || "",
        date: editingItem.date ? editingItem.date.slice(0, 10) : "",
        location: editingItem.location || "",
        status: editingItem.status,
        featured: editingItem.featured,
        sortOrder: editingItem.sortOrder,
        icon: (meta.icon as string) || "",
        videoUrl: (meta.videoUrl as string) || "",
        thumbnailUrl: (meta.thumbnailUrl as string) || "",
        duration: (meta.duration as string) || "",
        badge: (meta.badge as string) || "",
        bulletsText: Array.isArray(meta.bullets) ? (meta.bullets as string[]).join("\n") : "",
        detail: (meta.detail as string) || "",
      });
    } else {
      setForm({
        title: "",
        subtitle: "",
        description: "",
        content: "",
        imageUrl: "",
        category: "",
        date: "",
        location: "",
        status: "draft",
        featured: false,
        sortOrder: 0,
        icon: "",
        videoUrl: "",
        thumbnailUrl: "",
        duration: "",
        badge: "",
        bulletsText: "",
        detail: "",
      });
    }
    setError("");
    setSuccess(false);
  }, [editingItem, open]);

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildMetadata = (): Record<string, unknown> => {
    const meta: Record<string, unknown> = {};
    switch (contentType) {
      case "policy":
        if (form.bulletsText) meta.bullets = form.bulletsText.split("\n").filter(Boolean);
        if (form.detail) meta.detail = form.detail;
        if (form.icon) meta.icon = form.icon;
        break;
      case "leader":
        if (form.icon) meta.icon = form.icon;
        break;
      case "gallery":
        if (form.badge) meta.badge = form.badge;
        break;
      case "video":
        if (form.videoUrl) meta.videoUrl = form.videoUrl;
        if (form.thumbnailUrl) meta.thumbnailUrl = form.thumbnailUrl;
        if (form.duration) meta.duration = form.duration;
        break;
      case "value":
        if (form.icon) meta.icon = form.icon;
        break;
    }
    return Object.keys(meta).length > 0 ? meta : {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    setSubmitting(true);

    const body: Record<string, unknown> = {
      type: contentType,
      title: form.title,
      subtitle: form.subtitle || null,
      description: form.description || null,
      content: form.content || null,
      imageUrl: form.imageUrl || null,
      category: form.category || null,
      date: form.date || null,
      location: form.location || null,
      status: form.status,
      featured: form.featured,
      sortOrder: form.sortOrder,
      metadata: buildMetadata(),
    };

    try {
      const url = isEditing ? `/api/admin/content/${editingItem.id}` : "/api/admin/content";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(true);
        onSaved();
        setTimeout(() => {
          setSuccess(false);
          onOpenChange(false);
        }, 1000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save content.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = CONTENT_TYPES.find((t) => t.type === contentType)?.label || contentType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-arrc-950 flex items-center gap-2">
            <FileText className="h-5 w-5 text-arrc-gold" />
            {isEditing ? `Edit ${typeLabel}` : `New ${typeLabel}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the content item details." : `Create a new ${typeLabel.toLowerCase()} item.`}
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
            <h3 className="text-lg font-bold text-arrc-950">Saved Successfully!</h3>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg p-3 border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Common: Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {contentType === "faq" ? "Question *" : "Title *"}
              </Label>
              <Input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder={contentType === "faq" ? "Enter the FAQ question" : "Enter title"}
                className="border-gray-200 focus:border-arrc-gold"
                required
              />
            </div>

            {/* Subtitle - for news (excerpt), leaders (role/badge) */}
            {(contentType === "news" || contentType === "leader") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {contentType === "news" ? "Excerpt / Subtitle" : "Role / Badge"}
                </Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => handleChange("subtitle", e.target.value)}
                  placeholder={contentType === "news" ? "Brief excerpt" : "e.g. President, Secretary"}
                  className="border-gray-200 focus:border-arrc-gold"
                />
              </div>
            )}

            {/* Description - varies by type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {contentType === "leader" ? "Bio" : contentType === "gallery" ? "Caption" : contentType === "faq" ? "" : "Description"}
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={
                  contentType === "leader" ? "Leader biography" :
                  contentType === "gallery" ? "Image caption" :
                  contentType === "value" ? "Description of the value" :
                  "Enter description"
                }
                rows={3}
                className="border-gray-200 focus:border-arrc-gold"
              />
            </div>

            {/* Content - for news (rich text), faq (answer) */}
            {(contentType === "news" || contentType === "faq") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {contentType === "faq" ? "Answer *" : "Content"}
                </Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder={contentType === "faq" ? "Enter the answer" : "Full article content"}
                  rows={5}
                  className="border-gray-200 focus:border-arrc-gold"
                />
              </div>
            )}

            {/* Policy-specific: bullets + detail in metadata */}
            {contentType === "policy" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Key Points (one per line)</Label>
                  <Textarea
                    value={form.bulletsText}
                    onChange={(e) => handleChange("bulletsText", e.target.value)}
                    placeholder="Enter key points, one per line"
                    rows={4}
                    className="border-gray-200 focus:border-arrc-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Detail</Label>
                  <Textarea
                    value={form.detail}
                    onChange={(e) => handleChange("detail", e.target.value)}
                    placeholder="Policy detail text"
                    rows={3}
                    className="border-gray-200 focus:border-arrc-gold"
                  />
                </div>
              </>
            )}

            {/* Date + Location for Events */}
            {contentType === "event" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Event Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="border-gray-200 focus:border-arrc-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g. Johannesburg, Gauteng"
                    className="border-gray-200 focus:border-arrc-gold"
                  />
                </div>
              </div>
            )}

            {/* Date for News, Videos */}
            {(contentType === "news" || contentType === "video") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="border-gray-200 focus:border-arrc-gold"
                />
              </div>
            )}

            {/* Category for News, Policies, Gallery, FAQs */}
            {(contentType === "news" || contentType === "policy" || contentType === "gallery" || contentType === "faq") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g. Update, Governance, General"
                  className="border-gray-200 focus:border-arrc-gold"
                />
              </div>
            )}

            {/* Video-specific metadata */}
            {contentType === "video" && (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Video URL</Label>
                    <Input
                      value={form.videoUrl}
                      onChange={(e) => handleChange("videoUrl", e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="border-gray-200 focus:border-arrc-gold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Thumbnail URL</Label>
                    <Input
                      value={form.thumbnailUrl}
                      onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
                      placeholder="https://..."
                      className="border-gray-200 focus:border-arrc-gold"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Duration</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    placeholder="e.g. 5:30"
                    className="border-gray-200 focus:border-arrc-gold"
                  />
                </div>
              </div>
            )}

            {/* Gallery badge */}
            {contentType === "gallery" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Badge</Label>
                <Input
                  value={form.badge}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  placeholder="e.g. Featured, New"
                  className="border-gray-200 focus:border-arrc-gold"
                />
              </div>
            )}

            {/* Icon selector for Policies, Leaders, Values */}
            {(contentType === "policy" || contentType === "leader" || contentType === "value") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Icon</Label>
                <Select value={form.icon} onValueChange={(v) => handleChange("icon", v)}>
                  <SelectTrigger className="border-gray-200 focus:border-arrc-gold">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {LUCIDE_ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Image URL - common */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                placeholder="https://..."
                className="border-gray-200 focus:border-arrc-gold"
              />
            </div>

            {/* Status, Featured, Sort Order */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={form.status} onValueChange={(v) => handleChange("status", v as ContentStatus)}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                  className="border-gray-200"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(checked) => handleChange("featured", checked)}
                />
                <Label className="text-xs font-medium">Featured</Label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  isEditing ? "Save Changes" : "Create Item"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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

/* ─── Main CRMContentPanel Component ─── */
export function CRMContentPanel({ token }: { token: string }) {
  const [activeType, setActiveType] = useState<ContentType>("event");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [setupSQL, setSetupSQL] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Check if content database is ready
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/admin/setup", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const ready = data.contentDbReady ?? false;
          setTableExists(ready);
          if (!ready && data.sql) {
            setSetupSQL(data.sql);
          }
        }
      } catch {
        // ignore check failure, will be handled by content fetch
      }
    };
    checkSetup();
  }, [token]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ type: activeType });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/content?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.items || []);
      } else {
        setError("Failed to load content.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeType, statusFilter, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setError("Failed to delete item.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (item: ContentItem) => {
    const nextStatus: ContentStatus = item.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
        );
      }
    } catch {
      // silent fail for toggle
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setEditDialogOpen(true);
  };

  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const typeInfo = CONTENT_TYPES.find((t) => t.type === activeType);

  return (
    <div className="space-y-4">
      {/* Table missing banner */}
      {tableExists === false && setupSQL && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-amber-800">Content Table Not Found</h4>
              <p className="text-xs text-amber-700 mt-1">
                The <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">content_items</code> table
                doesn&apos;t exist in your Supabase database. Run the SQL below in the Supabase SQL Editor to create it.
              </p>
            </div>
          </div>
          <div className="relative">
            <pre className="bg-arrc-950 text-green-400 text-[11px] p-4 rounded-lg overflow-x-auto max-h-48 overflow-y-auto leading-relaxed">
              {setupSQL}
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 bg-arrc-950/80 border-arrc-800 text-white hover:bg-arrc-950 hover:text-arrc-gold text-xs"
              onClick={() => {
                navigator.clipboard.writeText(setupSQL);
                setSqlCopied(true);
                setTimeout(() => setSqlCopied(false), 2000);
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              {sqlCopied ? "Copied!" : "Copy SQL"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-amber-700 border-amber-200 hover:bg-amber-100"
              onClick={() => {
                window.open("https://supabase.com/dashboard", "_blank");
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Open Supabase Dashboard
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-700 border-amber-200 hover:bg-amber-100"
              onClick={async () => {
                const res = await fetch("/api/admin/setup", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) {
                  setTableExists(true);
                  setSetupSQL(null);
                  fetchItems();
                } else if (data.tableExists === false) {
                  alert("Table still doesn't exist. Please run the SQL in Supabase SQL Editor first.");
                }
              }}
            >
              Re-check
            </Button>
          </div>
        </motion.div>
      )}
      {/* Content Type Selector */}
      <div className="rounded-xl bg-white border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-arrc-950 flex items-center gap-2">
            {typeInfo && <typeInfo.icon className="h-4 w-4 text-arrc-gold" />}
            Content Management
          </h3>
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-arrc-gold text-arrc-950 hover:bg-arrc-gold/90 font-bold"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add New
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => {
                setActiveType(type);
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeType === type
                  ? "bg-arrc-gold text-arrc-950 shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${typeInfo?.label || "items"}...`}
            className="pl-9 border-gray-200 focus:border-arrc-gold"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg p-3 border border-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-100 p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-gray-100 rounded mb-3" />
              <div className="h-3 w-1/2 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-100 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 mx-auto mb-3">
            <FileText className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">
            No {typeInfo?.label || "items"} found.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters."
              : `Click "Add New" to create your first ${activeType} item.`}
          </p>
        </div>
      ) : (
        <motion.div
          key={activeType}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="rounded-xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow group"
              >
                {/* Image preview */}
                {item.imageUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-50">
                      <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Title & Badges */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-arrc-950 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  {item.featured && (
                    <Star className="h-3.5 w-3.5 text-arrc-gold shrink-0 fill-arrc-gold" />
                  )}
                </div>

                {/* Subtitle */}
                {item.subtitle && (
                  <p className="text-xs text-arrc-gold font-medium mb-1 truncate">
                    {item.subtitle}
                  </p>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <Badge variant="outline" className={contentStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  {item.category && (
                    <Badge variant="outline" className="bg-arrc-50 text-arrc-800 border-arrc-200">
                      {item.category}
                    </Badge>
                  )}
                  {item.date && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  )}
                  {item.location && (
                    <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                      {item.location}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-7 px-2 text-xs text-gray-600 hover:text-arrc-950 hover:bg-gray-50"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(item)}
                    className="h-7 px-2 text-xs text-gray-600 hover:text-arrc-950 hover:bg-gray-50"
                  >
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={deletingId === item.id}
                    className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 ml-auto"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Edit/Create Dialog */}
      <ContentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        token={token}
        contentType={activeType}
        editingItem={editingItem}
        onSaved={fetchItems}
      />
    </div>
  );
}
