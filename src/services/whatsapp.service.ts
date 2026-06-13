/**
 * WhatsApp Cloud API Service
 *
 * Server-side only — used inside Next.js API routes.
 * Uses axios directly (not the client-side apiConnector).
 *
 * All sends are fire-and-forget with retry logic.
 * Every send attempt is logged to WhatsappLog MongoDB collection.
 *
 * Exported functions:
 * - sendCustomerOrderReceived(order, listItems) — Customer notification on new order
 * - sendAdminNewOrder(order, listItems) — Admin notification on new order
 * - sendCustomerOrderConfirmed(order) — Customer notification on order confirmed
 * - resendWhatsAppMessage(logId) — Resend a previously logged message
 */

import axios from "axios";
import { connectDB } from "@/lib/db";
import WhatsappLogModel from "@/lib/models/WhatsappLog.model";
import AddressModel from "@/lib/models/Address.model";

// ─── Configuration ───────────────────────────────────────────
const WHATSAPP_API_VERSION = "v23.0";

function getConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!phoneNumberId || !accessToken) {
    console.warn(
      "⚠️ WhatsApp env variables missing (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN). WhatsApp notifications disabled."
    );
    return null;
  }

  return { phoneNumberId, accessToken, adminNumber };
}

// ─── Phone Number Normalizer ─────────────────────────────────
function normalizePhone(phone: string | number): string {
  let normalized = String(phone).replace(/[^0-9]/g, "");
  // Add India country code if 10-digit number
  if (normalized.length === 10) {
    normalized = `91${normalized}`;
  }
  return normalized;
}

// ─── Low-Level Sender with Retry (3 attempts) ───────────────
const MAX_RETRIES = 3;

async function sendWhatsAppMessage(
  to: string,
  message: string,
  orderId: string,
  messageType: "admin_notification" | "customer_order_received" | "customer_confirmation"
): Promise<{ success: boolean; response?: any; error?: any }> {
  const config = getConfig();

  if (!config) {
    // Log as failed due to missing config
    await connectDB();
    await WhatsappLogModel.create({
      orderId,
      recipient: to,
      messageType,
      message,
      status: "failed",
      response: { error: "WhatsApp configuration missing" },
      retryCount: 0,
    });
    return { success: false, error: "WhatsApp configuration missing" };
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: message,
    },
  };

  const headers = {
    Authorization: `Bearer ${config.accessToken}`,
    "Content-Type": "application/json",
  };

  let lastError: any = null;
  let retryCount = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(url, payload, { headers, timeout: 15000 });

      // Success — log and return
      await connectDB();
      await WhatsappLogModel.create({
        orderId,
        recipient: to,
        messageType,
        message,
        status: "sent",
        response: response.data,
        retryCount: attempt,
      });

      console.log(`✅ WhatsApp message sent to ${to} (attempt ${attempt})`);
      return { success: true, response: response.data };
    } catch (error: any) {
      lastError = error?.response?.data || error.message || error;
      retryCount = attempt;

      console.error(
        `❌ WhatsApp send attempt ${attempt}/${MAX_RETRIES} failed:`,
        lastError
      );

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted — log failure
  await connectDB();
  await WhatsappLogModel.create({
    orderId,
    recipient: to,
    messageType,
    message,
    status: "failed",
    response: lastError,
    retryCount,
  });

  console.error(`❌ WhatsApp message to ${to} failed after ${MAX_RETRIES} attempts`);
  return { success: false, error: lastError };
}

// ─── Helper: Build product lines from list_items ─────────────
function buildProductLines(listItems: any[]): string {
  return listItems
    .map((item: any) => {
      const name = item.product?.name || item.product_details?.name || "Unknown Product";
      const qty = item.quantity || 1;
      return `• ${name} × ${qty}`;
    })
    .join("\n");
}

// ─── Helper: Build product lines from populated order ────────
function buildProductLinesFromOrder(products: any[]): string {
  return (
    products
      ?.map((item: any) => {
        const name =
          item.productId?.name || item.product_details?.name || "Your product";
        const qty = item.quantity || 1;
        return `• ${name} × ${qty}`;
      })
      .join("\n") || "• Your product"
  );
}

// ═════════════════════════════════════════════════════════════
// 1. CUSTOMER — Order Received (on new order)
// ═════════════════════════════════════════════════════════════
export async function sendCustomerOrderReceived(
  createdOrder: any,
  listItems: any[]
) {
  try {
    // Get customer phone from populated userId or delivery_address
    const customerPhone =
      createdOrder.userId?.phone ||
      createdOrder.delivery_address?.mobile;

    if (!customerPhone) {
      console.warn("⚠️ Customer phone not found. Skipping customer order received WhatsApp.");
      return;
    }

    const normalizedPhone = normalizePhone(customerPhone);

    const customerName =
      createdOrder.userId?.fname && createdOrder.userId?.lname
        ? `${createdOrder.userId.fname} ${createdOrder.userId.lname}`
        : "Customer";

    const productLines = buildProductLines(listItems);
    const paymentMethod = createdOrder.payment_status || "N/A";

    const message = `🛒 Order Placed Successfully!

Hello ${customerName},

Your order has been received and is being processed.

Order ID: ${createdOrder.orderId}

Products:
${productLines}

Amount: ₹${createdOrder.totalAmt}
Payment: ${paymentMethod}
Status: Processing

We'll notify you once your order is confirmed.

Thank you for choosing Alpha Art & Events! 🎉`;

    await sendWhatsAppMessage(
      normalizedPhone,
      message,
      createdOrder.orderId,
      "customer_order_received"
    );
  } catch (error) {
    console.error("❌ sendCustomerOrderReceived error:", error);
    // Never throw — fire and forget
  }
}

// ═════════════════════════════════════════════════════════════
// 2. ADMIN — New Order Notification
// ═════════════════════════════════════════════════════════════
export async function sendAdminNewOrder(
  createdOrder: any,
  listItems: any[]
) {
  try {
    const config = getConfig();
    if (!config?.adminNumber) {
      console.warn("⚠️ ADMIN_WHATSAPP_NUMBER not set. Skipping admin notification.");
      return;
    }

    await connectDB();

    // Fetch the delivery address
    let addressText = "N/A";
    try {
      const address = await AddressModel.findById(createdOrder.delivery_address).lean();
      if (address) {
        const addr = address as any;
        addressText = [
          addr.address_line,
          addr.city,
          addr.state,
          addr.pincode,
          addr.country,
        ]
          .filter(Boolean)
          .join(", ");
      }
    } catch {
      console.warn("Could not fetch address for WhatsApp notification");
    }

    // Customer info
    const customerName =
      createdOrder.userId?.fname && createdOrder.userId?.lname
        ? `${createdOrder.userId.fname} ${createdOrder.userId.lname}`
        : "N/A";
    const customerPhone = createdOrder.userId?.phone || "N/A";

    const productLines = buildProductLines(listItems);
    const paymentMethod = createdOrder.payment_status || "N/A";

    const message = `🛒 New Order Received

Order ID: ${createdOrder.orderId}

Customer: ${customerName}
Phone: ${customerPhone}

Products:
${productLines}

Amount: ₹${createdOrder.totalAmt}
Payment: ${paymentMethod}

Address:
${addressText}

Date: ${new Date(createdOrder.createdAt || Date.now()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}`;

    await sendWhatsAppMessage(
      config.adminNumber,
      message,
      createdOrder.orderId,
      "admin_notification"
    );
  } catch (error) {
    console.error("❌ sendAdminNewOrder error:", error);
    // Never throw — fire and forget
  }
}

// ═════════════════════════════════════════════════════════════
// 3. CUSTOMER — Order Confirmed (on status → Accepted)
// ═════════════════════════════════════════════════════════════
export async function sendCustomerOrderConfirmed(populatedOrder: any) {
  try {
    // Extract customer phone number
    const customerPhone =
      populatedOrder.userId?.phone ||
      populatedOrder.delivery_address?.mobile;

    if (!customerPhone) {
      console.warn("⚠️ Customer phone not found. Skipping order confirmed WhatsApp.");
      return;
    }

    const normalizedPhone = normalizePhone(customerPhone);

    const customerName =
      populatedOrder.userId?.fname && populatedOrder.userId?.lname
        ? `${populatedOrder.userId.fname} ${populatedOrder.userId.lname}`
        : "Customer";

    const productLines = buildProductLinesFromOrder(populatedOrder.products);

    const message = `✅ Order Confirmed!

Hello ${customerName},

Great news! Your order has been confirmed.

Order ID: ${populatedOrder.orderId}

Products:
${productLines}

Amount: ₹${populatedOrder.totalAmt}
Status: Confirmed ✅

Thank you for choosing Alpha Art & Events! 🎉`;

    await sendWhatsAppMessage(
      normalizedPhone,
      message,
      populatedOrder.orderId,
      "customer_confirmation"
    );
  } catch (error) {
    console.error("❌ sendCustomerOrderConfirmed error:", error);
    // Never throw — fire and forget
  }
}

// ═════════════════════════════════════════════════════════════
// 4. RESEND — Re-send a previously logged message
// ═════════════════════════════════════════════════════════════
export async function resendWhatsAppMessage(logId: string) {
  await connectDB();

  const log = await WhatsappLogModel.findById(logId);
  if (!log) {
    throw new Error("WhatsApp log entry not found");
  }

  const result = await sendWhatsAppMessage(
    log.recipient,
    log.message,
    log.orderId,
    log.messageType
  );

  return result;
}
