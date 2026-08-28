"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  HandHeart,
  Heart,
  Check,
  Upload,
  Building2,
  CreditCard,
  Sparkles,
  Crown,
  Shield,
  PartyPopper,
  Camera,
  AlertCircle,
} from "lucide-react";

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const membershipSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  idNumber: z
    .string()
    .length(13, "ID number must be 13 digits")
    .regex(/^\d{13}$/, "ID number must be 13 digits"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().optional(),
  province: z.string().min(1, "Province is required"),
  occupation: z.string().optional(),
  wardBranch: z.string().optional(),
  paymentMethod: z.enum(["online", "branch"], {
    message: "Payment method is required",
  }),
  popiaConsent: z.literal(true, {
    message: "You must accept POPIA consent",
  }),
});

type MembershipForm = z.infer<typeof membershipSchema>;

const membershipCards: {
  icon: React.ElementType;
  title: string;
  price: string;
  priceDetail: string;
  description: string;
  benefits: string[];
  highlighted: boolean;
  accent: string;
}[] = [];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Membership() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selfieFileName, setSelfieFileName] = useState<string>("");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieUploadWarning, setSelfieUploadWarning] = useState<string>("");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Cleanup selfie preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [selfiePreview]);
  const formRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const isFormInView = useInView(formRef, { once: true, margin: "-50px" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MembershipForm>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      paymentMethod: "online",
      popiaConsent: undefined as unknown as true,
    },
  });

  const paymentMethod = watch("paymentMethod");
  const popiaConsent = watch("popiaConsent");

  const onSubmit = async (data: MembershipForm) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSelfieUploadWarning("");
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        const memberId = result.id as string;

        // Upload selfie if one was selected
        if (selfieFile && memberId) {
          try {
            const formData = new FormData();
            formData.append("file", selfieFile);
            formData.append("memberId", memberId);

            const uploadRes = await fetch("/api/members/upload-selfie", {
              method: "POST",
              body: formData,
            });

            if (!uploadRes.ok) {
              const uploadResult = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
              console.error("[membership] Selfie upload failed:", uploadResult.error);
              setSelfieUploadWarning(
                "Your registration was submitted, but we couldn't upload your photo. You can add it later."
              );
            }
          } catch (uploadErr) {
            console.error("[membership] Selfie upload error:", uploadErr);
            setSelfieUploadWarning(
              "Your registration was submitted, but we couldn't upload your photo. You can add it later."
            );
          }
        }

        setSubmitSuccess(true);
      } else {
        const result = await res.json();
        setSubmitError(result.error || "Registration failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="join" className="relative py-20 overflow-hidden bg-gradient-to-b from-arrc-950 via-arrc-900 to-arrc-950">
      {/* Blurred gold orbs in corners */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-arrc-gold/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-arrc-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-arrc-gold/6 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-arrc-gold/8 rounded-full blur-[120px] pointer-events-none" />
      {/* Subtle African pattern overlay */}
      <div className="absolute inset-0 african-pattern opacity-[0.02] pointer-events-none" />

      <div ref={sectionRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="badge-premium inline-flex items-center gap-2 rounded-full bg-arrc-gold/20 border border-arrc-gold/30 px-4 py-1.5 mb-4"
          >
            <Crown className="h-4 w-4 text-arrc-gold" />
            <span className="font-heading text-sm font-semibold text-arrc-gold">Become A Member</span>
          </motion.div>
          <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl tracking-tight">
            Join The{" "}
            <span className="gradient-text font-heading">Movement</span>
          </h2>
          <div className="mt-4 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-5 text-white/70 max-w-2xl mx-auto text-lg">
            Be part of the change. Join thousands of South Africans building a
            better future together.
          </p>
        </motion.div>

        {/* Membership Type Cards */}
        {membershipCards.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid gap-6 sm:grid-cols-3 mb-14"
          >
            {membershipCards.map((card) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  rotateX: 2,
                  rotateY: -2,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                style={{ transformPerspective: 1200 }}
                className="perspective-container"
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-300 cursor-default group ${
                    card.highlighted
                      ? "border-2 border-arrc-gold shadow-lg shadow-arrc-gold/10 depth-shadow"
                      : "border-arrc-200/60 hover:border-arrc-300 hover:shadow-md"
                  }`}
                >
                  {card.highlighted && (
                    <div className="absolute top-0 right-0 bg-arrc-gold text-arrc-950 text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </div>
                  )}
                  <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative p-6 sm:p-8 text-center">
                    <div
                      className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                        card.highlighted
                          ? "bg-gradient-to-br from-arrc-gold to-arrc-gold/80 shadow-lg shadow-arrc-gold/20"
                          : "bg-arrc-100"
                      }`}
                    >
                      <card.icon
                        className={`h-8 w-8 ${
                          card.highlighted ? "text-arrc-950" : "text-arrc-700"
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-arrc-950">
                      {card.title}
                    </h3>
                    <p className="text-3xl font-extrabold gradient-text mt-3">
                      {card.price}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{card.priceDetail}</p>
                    <p className="mt-3 text-sm text-gray-600">{card.description}</p>
                    <div className="mt-4 space-y-1.5">
                      {card.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Check className="h-3.5 w-3.5 text-arrc-gold shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="mb-14" />
        )}

        {/* Membership Form */}
        <div ref={formRef}>
          {submitSuccess ? (
            <motion.div
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="max-w-lg mx-auto"
            >
              <Card className="card-premium-dark border border-arrc-gold/10 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-arrc-gold via-arrc-gold/60 to-arrc-gold" />
                <CardContent className="p-8 sm:p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-arrc-gold/10 border border-arrc-gold/20"
                  >
                    <PartyPopper className="h-10 w-10 text-arrc-gold" />
                  </motion.div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Application Submitted!
                  </h3>
                  <p className="mt-3 text-white/70 leading-relaxed">
                    Thank you for joining the ARRC. We will review your application
                    and send confirmation to your email.
                  </p>
                  {selfieUploadWarning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-400 flex items-start gap-2"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{selfieUploadWarning}</span>
                    </motion.div>
                  )}
                  <div className="mt-6 rounded-lg bg-arrc-gold/10 border border-arrc-gold/30 p-4 text-sm">
                    <p className="font-heading font-semibold mb-1 text-arrc-gold">Payment Reference</p>
                    <p className="font-heading text-white/80">Capitec Bank · Acc: 2544478930 · R20.00</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setSelfieUploadWarning("");
                      setSelfieFile(null);
                      setSelfieFileName("");
                      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
                      setSelfiePreview(null);
                      reset();
                    }}
                    variant="outline"
                    className="mt-6 border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    Register Another Member
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate={isFormInView ? "visible" : "hidden"}
            >
              <Card className="card-premium-dark max-w-2xl mx-auto border border-arrc-gold/10 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-arrc-800 via-arrc-gold to-arrc-800" />
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-arrc-gold/10 border border-arrc-gold/20">
                      <Shield className="h-5 w-5 text-arrc-gold" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white">
                        Membership Application
                      </h3>
                      <p className="text-sm text-white/50">All fields marked * are required</p>
                    </div>
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400"
                    >
                      {submitError}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-heading text-sm font-medium text-white/80">
                          First Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          placeholder="Enter first name"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                        />
                        {errors.firstName && (
                          <p className="text-xs text-red-400">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-heading text-sm font-medium text-white/80">
                          Last Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          placeholder="Enter last name"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                        />
                        {errors.lastName && (
                          <p className="text-xs text-red-400">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ID Number */}
                    <div className="space-y-2">
                      <Label htmlFor="idNumber" className="font-heading text-sm font-medium text-white/80">
                        ID Number (13 digits) <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="idNumber"
                        {...register("idNumber")}
                        placeholder="e.g. 9001015800081"
                        maxLength={13}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                      />
                      {errors.idNumber && (
                        <p className="text-xs text-red-400">
                          {errors.idNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-heading text-sm font-medium text-white/80">
                          Email <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="your@email.com"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-400">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-heading text-sm font-medium text-white/80">
                          Phone <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          placeholder="e.g. 071 234 5678"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-400">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* DOB & Gender */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="font-heading text-sm font-medium text-white/80">
                          Date of Birth <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...register("dateOfBirth")}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold [color-scheme:dark]"
                        />
                        {errors.dateOfBirth && (
                          <p className="text-xs text-red-400">
                            {errors.dateOfBirth.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-heading text-sm font-medium text-white/80">
                          Gender <span className="text-red-400">*</span>
                        </Label>
                        <Select onValueChange={(v) => setValue("gender", v)}>
                          <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-arrc-gold">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && (
                          <p className="text-xs text-red-400">
                            {errors.gender.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-heading text-sm font-medium text-white/80">Address</Label>
                      <Input
                        id="address"
                        {...register("address")}
                        placeholder="Street address, suburb, city"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                      />
                    </div>

                    {/* Province */}
                    <div className="space-y-2">
                      <Label className="font-heading text-sm font-medium text-white/80">
                        Province <span className="text-red-400">*</span>
                      </Label>
                      <Select onValueChange={(v) => setValue("province", v)}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-arrc-gold">
                          <SelectValue placeholder="Select your province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.province && (
                        <p className="text-xs text-red-400">
                          {errors.province.message}
                        </p>
                      )}
                    </div>

                    {/* Occupation & Ward */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="font-heading text-sm font-medium text-white/80">Occupation</Label>
                        <Input
                          id="occupation"
                          {...register("occupation")}
                          placeholder="e.g. Teacher, Student, Business Owner"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wardBranch" className="font-heading text-sm font-medium text-white/80">Ward / Branch</Label>
                        <Input
                          id="wardBranch"
                          {...register("wardBranch")}
                          placeholder="e.g. Ward 12, Gauteng Branch"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-arrc-gold"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <Label className="font-heading text-sm font-medium text-white/80">
                        Payment Method <span className="text-red-400">*</span>
                      </Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) =>
                          setValue("paymentMethod", v as "online" | "branch")
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="online" className="border-white/30 text-arrc-gold" />
                          <Label htmlFor="online" className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-white/80">
                            <CreditCard className="h-4 w-4 text-arrc-gold" />
                            Online
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="branch" id="branch" className="border-white/30 text-arrc-gold" />
                          <Label htmlFor="branch" className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-white/80">
                            <Building2 className="h-4 w-4 text-arrc-gold" />
                            At Branch
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.paymentMethod && (
                        <p className="text-xs text-red-400">
                          {errors.paymentMethod.message}
                        </p>
                      )}
                    </div>

                    {/* Payment Info Box - glowing gold */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="rounded-xl border border-arrc-gold/30 bg-arrc-gold/10 p-5 shadow-lg shadow-arrc-gold/10"
                    >
                      <h4 className="font-heading font-semibold text-arrc-gold text-sm mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-arrc-gold" />
                        Payment Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/50">Bank:</span>
                          <span className="font-medium text-white/80">Capitec Bank</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Account Name:</span>
                          <span className="font-medium text-white/80">African Royal Rainbow Congress</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Account Number:</span>
                          <span className="font-mono font-bold text-white">2544478930</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-arrc-gold/20">
                          <span className="text-white/50">Amount:</span>
                          <span className="text-xl font-extrabold gradient-text">R20.00</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Selfie Upload */}
                    <div className="space-y-2">
                      <Label className="font-heading text-sm font-medium text-white/80">Selfie / Photo</Label>
                      <div className="flex items-center gap-4">
                        {selfiePreview ? (
                          <div className="relative shrink-0">
                            <img
                              src={selfiePreview}
                              alt="Selfie preview"
                              className="h-16 w-16 rounded-full object-cover border-2 border-arrc-gold/40 shadow-lg shadow-arrc-gold/10"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-arrc-gold flex items-center justify-center">
                              <Check className="h-3 w-3 text-arrc-950" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-white/15 bg-white/5">
                            <Camera className="h-6 w-6 text-white/30" />
                          </div>
                        )}
                        <label
                          htmlFor="selfie"
                          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/5 px-4 py-4 text-sm text-white/60 hover:bg-white/10 hover:border-arrc-gold/50 transition-all duration-300"
                        >
                          <Upload className="h-5 w-5 text-arrc-gold" />
                          {selfieFileName || "Click to upload your selfie"}
                        </label>
                        <input
                          id="selfie"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelfieFileName(file.name);
                              setSelfieFile(file);
                              // Cleanup old preview URL if exists
                              if (selfiePreview) URL.revokeObjectURL(selfiePreview);
                              setSelfiePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-white/30 flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        JPEG, PNG, WebP or HEIC · Max 10 MB
                      </p>
                    </div>

                    {/* POPIA Consent */}
                    <div className="flex items-start space-x-3 pt-2">
                      <Checkbox
                        id="popia"
                        checked={popiaConsent === true}
                        onCheckedChange={(checked) =>
                          setValue("popiaConsent", (checked ? true : undefined) as true, {
                            shouldValidate: true,
                          })
                        }
                        className="mt-0.5 border-white/30 data-[state=checked]:bg-arrc-gold data-[state=checked]:border-arrc-gold"
                      />
                      <div className="space-y-1 leading-snug">
                        <Label htmlFor="popia" className="font-heading text-sm cursor-pointer leading-snug text-white/80">
                          I consent to the processing of my personal information in
                          accordance with the Protection of Personal Information Act
                          (POPIA) and the ARRC Privacy Policy.{" "}
                          <span className="text-red-400">*</span>
                        </Label>
                        {errors.popiaConsent && (
                          <p className="text-xs text-red-400">
                            {errors.popiaConsent.message}
                          </p>
                        )}
                        <p className="flex items-center gap-1 text-white/30 text-xs mt-1">
                          <Shield className="h-3 w-3" />
                          Your data is protected under POPIA
                        </p>
                      </div>
                    </div>

                    {/* Submit */}
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="font-heading w-full bg-gradient-to-r from-arrc-gold to-arrc-gold/90 text-arrc-950 hover:from-arrc-gold/90 hover:to-arrc-gold/80 font-bold h-14 text-base shadow-[0_0_25px_rgba(212,168,67,0.4)] hover:shadow-[0_0_35px_rgba(212,168,67,0.6)] transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="inline-block h-4 w-4 border-2 border-arrc-950/30 border-t-arrc-950 rounded-full"
                            />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Crown className="h-5 w-5" />
                            Pay R20 & Join The ARRC
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
