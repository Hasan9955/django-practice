import { Store, User } from "@prisma/client";
import sendEmail from "../helpers/sendMailBrevo";
import { getPlatformLogo } from "../helpers/sendMailOfOrderConfirmation";
import prisma from "../shared/prisma";

export const sendAdminStoreApprovalEmail = async (
  store: Store,
  owner: User, 
) => {
    let adminEmail = "";
  const subject = "New Store Pending Approval";
  const platformLogo = await getPlatformLogo();

  const admin = await prisma.user.findFirst({
    where: {
        role: "ADMIN"
    }
  })

  if (!admin?.email) {
    return
  }

  adminEmail = admin?.email

  const html = `
  <body style="font-family: Arial, Helvetica, sans-serif; background:#f6f9fc; padding:20px; margin:0;">
    <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#ffffff; padding:24px; text-align:center; border-bottom:4px solid #007BFF;">
        <img
          src="${platformLogo}"
          alt="Sellapy"
          style="max-height:60px; max-width:220px; object-fit:contain;"
        />
      </div>

      <!-- Body -->
      <div style="padding:30px;">

        <h2 style="margin-top:0; color:#007BFF;">
          🏪 New Store Pending Approval
        </h2>

        <p style="font-size:15px; color:#555;">
          A new seller has successfully created a store on <strong>Sellapy</strong>.
          The store is currently waiting for administrator approval.
        </p>

        <table
          width="100%"
          cellpadding="10"
          cellspacing="0"
          style="border-collapse:collapse; margin:25px 0; border:1px solid #e5e5e5;"
        >
          <tr style="background:#f8f9fa;">
            <td><strong>Store Name</strong></td>
            <td>${store.shopName}</td>
          </tr>

          <tr>
            <td><strong>Owner Name</strong></td>
            <td>${owner.fullName}</td>
          </tr>

          <tr style="background:#f8f9fa;">
            <td><strong>Email</strong></td>
            <td>${owner.email}</td>
          </tr>

          <tr>
            <td><strong>Created At</strong></td>
            <td>${new Date(store.createdAt).toLocaleString()}</td>
          </tr>

          <tr style="background:#f8f9fa;">
            <td><strong>Status</strong></td>
            <td style="color:#d97706; font-weight:bold;">
              Pending Approval
            </td>
          </tr>
        </table>

        <div style="text-align:center; margin-top:30px;">
          <a
            href="https://sellapy.com/dashboard/seller&store-oversight/store-approvals"
            style="
              display:inline-block;
              padding:12px 28px;
              background:#007BFF;
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            "
          >
            Review Store
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div
        style="
          background:#f6f9fc;
          padding:20px;
          text-align:center;
          border-top:1px solid #e5e5e5;
        "
      >
        <img
          src="${platformLogo}"
          alt="Sellapy"
          style="max-height:40px; opacity:.7;"
        />

        <p style="margin:10px 0 0; color:#777; font-size:13px;">
          This is an automated notification from Sellapy.
        </p>
      </div>

    </div>
  </body>
  `;

  await sendEmail(adminEmail, subject, html);
};