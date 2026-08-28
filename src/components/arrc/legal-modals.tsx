"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Shield, FileText, Lock } from "lucide-react";

const modalContent = {
  privacy: {
    icon: Shield,
    title: "Privacy Policy",
    description: "How the ARRC handles your personal information",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>
          The African Royal Rainbow Congress (ARRC) is committed to protecting
          your privacy and personal information in accordance with the
          Constitution of the Republic of South Africa and the Protection of
          Personal Information Act (POPIA), Act 4 of 2013.
        </p>
        <h4 className="font-semibold text-arrc-950">Information We Collect</h4>
        <p>
          We collect personal information that you voluntarily provide when
          joining the ARRC, including your name, ID number, contact details,
          date of birth, gender, address, province, and occupation. This
          information is necessary for membership administration and compliance
          with the Electoral Commission of South Africa (IEC) requirements.
        </p>
        <h4 className="font-semibold text-arrc-950">How We Use Your Information</h4>
        <p>
          Your information is used solely for: membership administration,
          communication about party activities and events, compliance with
          legal obligations, and improving our services to members. We will
          never sell or share your personal information with third parties for
          commercial purposes.
        </p>
        <h4 className="font-semibold text-arrc-950">Data Security</h4>
        <p>
          We implement appropriate technical and organisational measures to
          protect your personal information against unauthorised access,
          alteration, or destruction. All data is stored securely and access
          is restricted to authorised personnel only.
        </p>
        <h4 className="font-semibold text-arrc-950">Your Rights</h4>
        <p>
          Under POPIA, you have the right to: access your personal information,
          request correction of inaccurate information, request deletion of
          your information (subject to legal requirements), object to
          processing of your information, and withdraw consent at any time.
        </p>
        <h4 className="font-semibold text-arrc-950">Contact</h4>
        <p>
          For privacy-related queries, contact us at info@arrc.co.za.
        </p>
        <p className="text-xs text-gray-400">Last updated: February 2025</p>
      </div>
    ),
  },
  terms: {
    icon: FileText,
    title: "Terms of Service",
    description: "Terms governing use of ARRC services and membership",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>
          By joining the African Royal Rainbow Congress (ARRC) and using our
          services, you agree to the following terms and conditions.
        </p>
        <h4 className="font-semibold text-arrc-950">Membership</h4>
        <p>
          Membership is open to all South African citizens aged 16 and above
          who share the values and objectives of the ARRC. The annual
          membership fee is R20.00 and must be paid to maintain active
          membership status.
        </p>
        <h4 className="font-semibold text-arrc-950">Code of Conduct</h4>
        <p>
          Members are expected to conduct themselves in a manner consistent
          with the values of the ARRC: transparency, justice, progress, and
          unity. Discrimination, hate speech, violence, or any conduct
          contrary to the Constitution of the Republic of South Africa is
          strictly prohibited and may result in termination of membership.
        </p>
        <h4 className="font-semibold text-arrc-950">Payments</h4>
        <p>
          Membership fees are payable to: Capitec Bank, Account Name: African
          Royal Rainbow Congress, Account Number: 2544478930. Proof of
          payment should be retained as confirmation. Fees are non-refundable.
        </p>
        <h4 className="font-semibold text-arrc-950">Intellectual Property</h4>
        <p>
          All content, logos, and materials associated with the ARRC are the
          intellectual property of the African Royal Rainbow Congress and may
          not be used without prior written consent.
        </p>
        <h4 className="font-semibold text-arrc-950">Liability</h4>
        <p>
          The ARRC provides information and services on an &ldquo;as is&rdquo;
          basis. We make every effort to ensure accuracy but cannot guarantee
          that all information is error-free. The ARRC shall not be liable for
          any direct or indirect damages arising from the use of our services.
        </p>
        <p className="text-xs text-gray-400">Last updated: February 2025</p>
      </div>
    ),
  },
  popia: {
    icon: Lock,
    title: "POPIA Compliance",
    description: "Our commitment to the Protection of Personal Information Act",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>
          The African Royal Rainbow Congress is fully committed to compliance
          with the Protection of Personal Information Act (POPIA), Act 4 of
          2013, which gives effect to the constitutional right to privacy.
        </p>
        <h4 className="font-semibold text-arrc-950">Our POPIA Commitment</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            We process personal information lawfully, reasonably, and in a
            manner that does not infringe on your privacy.
          </li>
          <li>
            We collect only the minimum personal information necessary for
            membership administration and legal compliance.
          </li>
          <li>
            We retain personal information only for as long as necessary for
            the purpose for which it was collected.
          </li>
          <li>
            We ensure that personal information is accurate, complete, and
            up-to-date.
          </li>
          <li>
            We implement appropriate security measures to protect your
            personal information.
          </li>
        </ul>
        <h4 className="font-semibold text-arrc-950">Information Officer</h4>
        <p>
          Our Information Officer is registered with the Information Regulator
          of South Africa. All POPIA-related queries and requests can be
          directed to: info@arrc.co.za.
        </p>
        <h4 className="font-semibold text-arrc-950">Your Rights Under POPIA</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Right to be notified when personal information is collected</li>
          <li>Right of access to your personal information</li>
          <li>Right to request correction of your personal information</li>
          <li>Right to request deletion of your personal information</li>
          <li>Right to object to processing of your personal information</li>
          <li>Right to withdraw consent at any time</li>
          <li>Right to lodge a complaint with the Information Regulator</li>
        </ul>
        <p className="text-xs text-gray-400">Last updated: February 2025</p>
      </div>
    ),
  },
};

type ModalType = "privacy" | "terms" | "popia";

export function LegalModals() {
  const [openModal, setOpenModal] = useState<ModalType | null>(null);

  useEffect(() => {
    const handlePrivacy = () => setOpenModal("privacy");
    const handleTerms = () => setOpenModal("terms");
    const handlePopia = () => setOpenModal("popia");

    window.addEventListener("arrc:open-privacy", handlePrivacy);
    window.addEventListener("arrc:open-terms", handleTerms);
    window.addEventListener("arrc:open-popia", handlePopia);

    return () => {
      window.removeEventListener("arrc:open-privacy", handlePrivacy);
      window.removeEventListener("arrc:open-terms", handleTerms);
      window.removeEventListener("arrc:open-popia", handlePopia);
    };
  }, []);

  const currentModal = openModal ? modalContent[openModal] : null;
  const Icon = currentModal?.icon;

  return (
    <AnimatePresence>
      {openModal && currentModal && (
        <Dialog open={!!openModal} onOpenChange={(open) => !open && setOpenModal(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader>
                <DialogTitle className="text-arrc-950 flex items-center gap-2">
                  {Icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arrc-gold/10">
                      <Icon className="h-4 w-4 text-arrc-gold" />
                    </div>
                  )}
                  {currentModal.title}
                </DialogTitle>
                <DialogDescription>
                  {currentModal.description}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {currentModal.content}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
