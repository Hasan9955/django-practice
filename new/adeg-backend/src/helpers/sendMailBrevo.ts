// src/utils/sendEmail.ts

import nodemailer from "nodemailer";
import config from "../config";
import prisma from "../shared/prisma";

// ─── Suppression List Helper ──────────────────────────────
const isEmailSuppressed = async (email: string): Promise<boolean> => {
  const suppressed = await prisma.emailSuppression.findUnique({
    where: { email },
  });
  return !!suppressed;
};

const addToSuppressionList = async (
  email: string,
  reason: string,
  diagnosticCode?: string,
) => {
  await prisma.emailSuppression.upsert({
    where: { email },
    update: { reason, diagnosticCode, updatedAt: new Date() },
    create: { email, reason, diagnosticCode },
  });
  console.warn(`⛔ Added to suppression list: ${email} | Reason: ${reason}`);
};

// ─── Transporter (created once, reused) ───────────────────
const transporter = nodemailer.createTransport({
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  secure: false,
  auth: {
    user: config.emailSender.email_user_name,
    pass: config.emailSender.email_pass,
  },
  // Connection pool - don't recreate for every email
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// ─── Error Classifier ─────────────────────────────────────
const classifyError = (error: any): "permanent" | "temporary" | "unknown" => {
  const message = error?.message || "";
  const responseCode = error?.responseCode || 0;

  // Permanent failures - never retry
  if (
    responseCode === 550 ||
    responseCode === 551 ||
    responseCode === 553 ||
    message.includes("550") ||
    message.includes("Access denied") ||
    message.includes("User unknown") ||
    message.includes("does not exist")
  ) {
    return "permanent";
  }

  // Temporary failures - can retry
  if (
    responseCode === 421 ||
    responseCode === 452 ||
    message.includes("temporarily") ||
    message.includes("try again")
  ) {
    return "temporary";
  }

  return "unknown";
};

// ─── Main sendEmail Function ───────────────────────────────
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<{ success: boolean; messageId?: string; reason?: string }> => {
  try {
    // 1. Check suppression list first
    const suppressed = await isEmailSuppressed(to);
    if (suppressed) {
      console.warn(`⛔ Skipping suppressed email: ${to}`);
      return { success: false, reason: "EMAIL_SUPPRESSED" };
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error(`❌ Invalid email format: ${to}`);
      return { success: false, reason: "INVALID_EMAIL_FORMAT" };
    }

    // 3. Send email
    const result = await transporter.sendMail({
      from: `Sellapy <no-reply@sellapy.com>`,
      to,
      subject,
      html,
      text,
    });

    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    const errorType = classifyError(error);

    console.error(`❌ Email failed to ${to}:`, {
      type: errorType,
      code: error?.responseCode,
      message: error?.message,
    });

    // 4. Permanent bounce → add to suppression list immediately
    if (errorType === "permanent") {
      await addToSuppressionList(to, "PERMANENT_BOUNCE", error?.message);
      return { success: false, reason: "PERMANENT_BOUNCE" };
    }

    // 5. Temporary failure → let caller retry via queue
    if (errorType === "temporary") {
      return { success: false, reason: "TEMPORARY_FAILURE" };
    }

    // 6. Unknown error → rethrow for BullMQ to handle retries
    throw error;
  }
};

export default sendEmail;
