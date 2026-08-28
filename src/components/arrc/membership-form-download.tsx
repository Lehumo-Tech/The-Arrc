"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  Printer,
  ArrowRight,
  Crown,
} from "lucide-react";

export function MembershipFormDownload() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const handleDownloadForm = () => {
    const formHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARRC Membership Application Form</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; background: white; }
  .header { text-align: center; border-bottom: 3px solid #0a1628; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 18px; color: #0a1628; letter-spacing: 2px; }
  .header h2 { font-size: 12px; color: #d4a843; margin-top: 4px; }
  .payment-banner { background: #0a1628; color: white; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .payment-banner .bank-info { font-size: 10px; }
  .payment-banner .bank-info strong { color: #d4a843; }
  .photo-box { position: absolute; top: 0; right: 0; width: 100px; height: 120px; border: 2px dashed #d4a843; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #0a1628; font-size: 9px; }
  .photo-box .icon { font-size: 24px; margin-bottom: 4px; }
  .form-section { margin-bottom: 14px; }
  .form-section h3 { font-size: 12px; color: #0a1628; border-bottom: 1px solid rgba(212,168,67,0.3); padding-bottom: 4px; margin-bottom: 8px; }
  .form-row { display: flex; gap: 12px; margin-bottom: 8px; }
  .form-field { flex: 1; }
  .form-field label { display: block; font-weight: bold; font-size: 10px; margin-bottom: 2px; color: #374151; }
  .form-field .input-line { border-bottom: 1px solid #9ca3af; min-height: 20px; padding: 2px 0; }
  .declaration { background: #fdf9ef; border: 1px solid rgba(212,168,67,0.2); padding: 12px; border-radius: 6px; margin-top: 16px; font-size: 9px; line-height: 1.5; }
  .signature-row { display: flex; gap: 40px; margin-top: 20px; }
  .signature-box { flex: 1; }
  .signature-box .sig-line { border-bottom: 1px solid #1a1a1a; margin-top: 40px; margin-bottom: 4px; }
  .signature-box .sig-label { font-size: 9px; color: #6b7280; }
  .footer { text-align: center; margin-top: 20px; padding-top: 8px; border-top: 2px solid #d4a843; font-size: 8px; color: #9ca3af; }
  .fee-badge { display: inline-block; background: #d4a843; color: #0a1628; font-weight: bold; font-size: 14px; padding: 4px 12px; border-radius: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>AFRICAN ROYAL RAINBOW CONGRESS</h1>
  <h2>Membership Application Form</h2>
</div>

<div class="payment-banner">
  <div class="bank-info">
    <strong>Bank:</strong> Capitec Bank &nbsp;|&nbsp;
    <strong>Account Name:</strong> African Royal Rainbow Congress &nbsp;|&nbsp;
    <strong>Account Number:</strong> 2544478930
  </div>
  <div class="fee-badge">R20.00</div>
</div>

<div style="position: relative;">
  <div class="photo-box">
    <div class="icon">📷</div>
    <div>Attach Selfie</div>
    <div>/ Photo Here</div>
  </div>

  <div class="form-section">
    <h3>Personal Information</h3>
    <div class="form-row">
      <div class="form-field"><label>Surname</label><div class="input-line"></div></div>
      <div class="form-field"><label>First Names</label><div class="input-line"></div></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>ID Number (13 digits)</label><div class="input-line"></div></div>
      <div class="form-field"><label>Date of Birth</label><div class="input-line"></div></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Gender</label><div class="input-line"></div></div>
      <div class="form-field"><label>Phone</label><div class="input-line"></div></div>
    </div>
    <div class="form-row">
      <div class="form-field" style="flex: 2;"><label>Email</label><div class="input-line"></div></div>
    </div>
  </div>

  <div class="form-section">
    <h3>Address & Branch</h3>
    <div class="form-row">
      <div class="form-field" style="flex: 2;"><label>Residential Address</label><div class="input-line"></div></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Province</label><div class="input-line"></div></div>
      <div class="form-field"><label>Occupation</label><div class="input-line"></div></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Ward / Branch</label><div class="input-line"></div></div>
      <div class="form-field"><label>Payment Method</label><div class="input-line">☐ Online &nbsp; ☐ At Branch</div></div>
    </div>
  </div>
</div>

<div class="declaration">
  <strong>DECLARATION:</strong> I, the undersigned, hereby apply for membership of the African Royal Rainbow Congress (ARRC). I confirm that I am a South African citizen aged 16 years or older. I understand that the annual membership fee of R20.00 is payable to Capitec Bank, Account Name: African Royal Rainbow Congress, Account Number: 2544478930. I agree to abide by the ARRC Constitution, Code of Conduct, and the laws of the Republic of South Africa. I consent to the processing of my personal information in accordance with POPIA (Act 4 of 2013). I declare that all information provided is true and correct.
</div>

<div class="signature-row">
  <div class="signature-box">
    <div class="sig-line"></div>
    <div class="sig-label">Applicant Signature &amp; Date</div>
  </div>
  <div class="signature-box">
    <div class="sig-line"></div>
    <div class="sig-label">Branch Chairperson Signature &amp; Date</div>
  </div>
</div>

<div class="footer">
  African Royal Rainbow Congress &nbsp;|&nbsp; Capitec Bank: 2544478930 &nbsp;|&nbsp; Membership Fee: R20.00/year &nbsp;|&nbsp; www.arrc.co.za
</div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(formHTML);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#fdf9ef] to-white">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-arrc-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-arrc-gold/3 rounded-full blur-3xl" />
      </div>
      {/* African pattern overlay */}
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.02]" />

      <div ref={sectionRef} className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-4 py-1.5 mb-4"
          >
            <FileText className="h-4 w-4 text-arrc-gold" />
            <span className="text-sm font-semibold text-arrc-gold font-heading">Printable Forms</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-arrc-950 sm:text-5xl tracking-tight font-heading">
            Download{" "}
            <span className="gradient-text font-heading">Membership Form</span>
          </h2>
          <div className="mt-4 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-5 text-gray-600 max-w-xl mx-auto">
            Download and print the official ARRC membership application form.
            Your membership card will be issued by the ARRC admin team once your
            application is approved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md mx-auto"
        >
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="h-full border-arrc-gold/20 hover:border-arrc-gold/50 hover:shadow-lg hover:shadow-arrc-gold/10 transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-arrc-gold/80 via-arrc-gold to-arrc-gold/80" />
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-arrc-gold/10 group-hover:bg-arrc-gold/15 transition-colors">
                  <Printer className="h-8 w-8 text-arrc-gold" />
                </div>
                <h3 className="text-lg font-bold text-arrc-950 font-heading">
                  Print Membership Form
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Download the official ARRC membership application form. Print it,
                  fill it in, and submit at your nearest branch.
                </p>
                <div className="mt-4 rounded-lg bg-arrc-gold/5 border border-arrc-gold/15 p-3 text-xs text-arrc-950 w-full">
                  <p className="font-semibold mb-1">Form includes:</p>
                  <p>Personal info, payment details, POPIA consent &amp; declaration</p>
                </div>
                <Button
                  onClick={handleDownloadForm}
                  className="mt-6 bg-gradient-to-r from-arrc-gold to-arrc-gold/90 hover:from-arrc-gold/90 hover:to-arrc-gold/80 text-arrc-950 font-bold gap-2 w-full shadow-[0_0_20px_rgba(212,168,67,0.3)]"
                >
                  <Crown className="h-4 w-4" />
                  Download &amp; Print Form
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
