/**
 * Email notification layer (best-effort).
 *
 * SMTP is not configured in this deployment, so notifications are logged to the
 * server console only. If you later configure SMTP, install `nodemailer` and
 * restore the transporter logic. All functions are safe to call and never throw
 * — they resolve with `{ sent: false }` when email cannot be delivered.
 */

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "info@arrc.co.za";

export interface NewMemberNotification {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  province: string;
  paymentMethod: string;
  memberId: string;
}

/* ─── Send notification (log-only fallback) ─── */
export async function sendNewMemberEmail(
  data: NewMemberNotification
): Promise<{ sent: boolean; error?: string }> {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("📧  NEW MEMBER NOTIFICATION (SMTP not configured — log only)");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Name:     ${data.firstName} ${data.lastName}`);
  console.log(`  Email:    ${data.email}`);
  console.log(`  Phone:    ${data.phone}`);
  console.log(`  ID:       ${data.idNumber}`);
  console.log(`  Province: ${data.province}`);
  console.log(`  Payment:  ${data.paymentMethod}`);
  console.log(`  Member #: ${data.memberId}`);
  console.log(`  To:       ${NOTIFY_EMAIL}`);
  console.log("═══════════════════════════════════════════════════\n");
  return { sent: false, error: "SMTP not configured" };
}
