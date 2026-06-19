/**
 * WhatsApp MSG91 API Service
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
 * - sendCustomerOrderConfirmed(order) — Customer notification on order confirmed (uses MSG91 template)
 * - resendWhatsAppMessage(logId) — Resend a previously logged message
 */

import axios from "axios";
import { connectDB } from "@/lib/db";
import WhatsappLogModel from "@/lib/models/WhatsappLog.model";
import AddressModel from "@/lib/models/Address.model";
import OrderModel from "@/lib/models/Order.model";
import UserModel from "@/lib/models/User.model";

// ─── Configuration ───────────────────────────────────────────
const MSG91_API_URL =
  "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

function getConfig() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const integratedNumber = process.env.MSG91_WHATSAPP_NUMBER;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!authKey || !integratedNumber) {
    console.warn(
      "⚠️ MSG91 env variables missing (MSG91_AUTH_KEY or MSG91_WHATSAPP_NUMBER). WhatsApp notifications disabled."
    );
    return null;
  }

  return { authKey, integratedNumber, adminNumber };
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

// ─── Low-Level Sender: MSG91 Text Message (with Retry) ──────
// REMOVED: MSG91 bulk API only supports templates. Plain text is not supported.
const MAX_RETRIES = 3;

// ─── Low-Level Sender: MSG91 Template Message (with Retry) ──
async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  templateNamespace: string | null,
  components: Record<string, { type: string; value: string; parameter_name?: string }>,
  orderId: string,
  messageType:
    | "admin_notification"
    | "customer_order_received"
    | "customer_confirmation",
  logMessage: string
): Promise<{ success: boolean; response?: any; error?: any }> {
  const config = getConfig();

  if (!config) {
    await connectDB();
    await WhatsappLogModel.create({
      orderId,
      recipient: to,
      messageType,
      message: logMessage,
      status: "failed",
      response: { error: "MSG91 configuration missing" },
      retryCount: 0,
    });
    return { success: false, error: "MSG91 configuration missing" };
  }

  // Split by comma if it's a string containing multiple numbers, and normalize all
  const toArray = (typeof to === "string" ? to.split(",") : [to])
    .map((n) => normalizePhone(n.trim()))
    .filter((n) => n.length > 0);

  // MSG91 API strictly rejects newlines (\n) in template body values
  const sanitizedComponents: any = {};
  for (const key in components) {
    sanitizedComponents[key] = {
      ...components[key],
      value: String(components[key].value).replace(/\r?\n|\r/g, " "),
    };
  }

  const payload = {
    integrated_number: config.integratedNumber,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en",
          policy: "deterministic",
        },
        namespace: templateNamespace || null,
        to_and_components: [
          {
            to: toArray,
            components: sanitizedComponents,
          },
        ],
      },
    },
  };

  const headers = {
    "Content-Type": "application/json",
    authkey: config.authKey,
  };

  let lastError: any = null;
  let retryCount = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(MSG91_API_URL, payload, {
        headers,
        timeout: 15000,
      });

      // Success — log and return
      await connectDB();
      await WhatsappLogModel.create({
        orderId,
        recipient: to,
        messageType,
        message: logMessage,
        status: "sent",
        response: response.data,
        retryCount: attempt,
      });

      console.log(
        `✅ WhatsApp template "${templateName}" sent to ${to} (attempt ${attempt})`
      );
      return { success: true, response: response.data };
    } catch (error: any) {
      lastError = error?.response?.data || error.message || error;
      retryCount = attempt;

      console.error(
        `❌ WhatsApp template send attempt ${attempt}/${MAX_RETRIES} failed:`,
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
    message: logMessage,
    status: "failed",
    response: lastError,
    retryCount,
  });

  console.error(
    `❌ WhatsApp template to ${to} failed after ${MAX_RETRIES} attempts`
  );
  return { success: false, error: lastError };
}

// ─── Helper: Build product lines from list_items ─────────────
function buildProductLines(listItems: any[]): string {
  return listItems
    .map((item: any) => {
      const name =
        item.product?.name || item.product_details?.name || "Unknown Product";
      const qty = item.quantity || 1;
      const price = item.product?.price || item.product_details?.price || 0;
      return `• ${name} × ${qty} (₹${price * qty})`;
    })
    .join(", ");
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
      .join(", ") || "• Your product"
  );
}

// ─── Helper: Get first product name from order ───────────────
function getFirstProductName(products: any[]): string {
  if (!products || products.length === 0) return "Your order";
  const firstProduct =
    products[0]?.productId?.name ||
    products[0]?.product_details?.name ||
    "Your order";
  if (products.length > 1) {
    return `${firstProduct} + ${products.length - 1} more`;
  }
  return firstProduct;
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
      createdOrder.userId?.phone || createdOrder.delivery_address?.mobile;

    if (!customerPhone) {
      console.warn(
        "⚠️ Customer phone not found. Skipping customer order received WhatsApp."
      );
      return;
    }

    const normalizedPhone = normalizePhone(customerPhone);

    const customerName =
      createdOrder.userId?.fname && createdOrder.userId?.lname
        ? `${createdOrder.userId.fname} ${createdOrder.userId.lname}`
        : "Customer";

    const productName = getFirstProductName(
      listItems.map((item: any) => ({
        product_details: { name: item.product?.name || item.product_details?.name },
      }))
    );
    const amount = `₹${createdOrder.totalAmt}`;

    const components = {
      body_1: {
        type: "text",
        value: customerName,
      },
      body_2: {
        type: "text",
        value: createdOrder.orderId,
      },
      body_3: {
        type: "text",
        value: productName,
      },
      body_4: {
        type: "text",
        value: amount,
      },
      body_5: {
        type: "text",
        value: "Alpha Art & Events",
      },
    };

    const logMessage = `✅ Order Received! Hello ${customerName}, your order #${createdOrder.orderId} for ${productName} (${amount}) has been received. [Template: order_approved_new]`;

    await sendWhatsAppTemplateMessage(
      normalizedPhone,
      "order_approved_new",
      "d7c7b754_9f04_41ef_a1c2_e61f103806b5",
      components,
      createdOrder.orderId,
      "customer_order_received",
      logMessage
    );
  } catch (error) {
    console.error("❌ sendCustomerOrderReceived error:", error);
    // Never throw — fire and forget
  }
}

// ═════════════════════════════════════════════════════════════
// 2. ADMIN — New Order Notification
//    Uses MSG91 "new_order_admin" template
// ═════════════════════════════════════════════════════════════
export async function sendAdminNewOrder(
  createdOrder: any,
  listItems: any[]
) {
  try {
    const config = getConfig();
    if (!config?.adminNumber) {
      console.warn(
        "⚠️ ADMIN_WHATSAPP_NUMBER not set. Skipping admin notification."
      );
      return;
    }

    await connectDB();

    // Fetch the delivery address
    let addressText = "N/A";
    try {
      const address = await AddressModel.findById(
        createdOrder.delivery_address
      ).lean();
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

    // Detailed product list with prices
    const productList = buildProductLines(listItems);
    const amount = `${createdOrder.totalAmt}`;

    // Template components for perfect Admin template (using body_1, body_2 format for numbered variables)
    const components = {
      body_1: {
        type: "text",
        value: customerName,
      },
      body_2: {
        type: "text",
        value: customerPhone,
      },
      body_3: {
        type: "text",
        value: addressText,
      },
      body_4: {
        type: "text",
        value: createdOrder.orderId,
      },
      body_5: {
        type: "text",
        value: productList,
      },
      body_6: {
        type: "text",
        value: amount,
      },
      body_7: {
        type: "text",
        value: createdOrder.payment_status || "COD",
      },
    };

    // Log message for WhatsApp logs
    const logMessage = `🛒 New Order! Customer: ${customerName} (${customerPhone}), Order: #${createdOrder.orderId}, Amount: ₹${amount} [Template: admin_order_notification]`;

    await sendWhatsAppTemplateMessage(
      config.adminNumber,
      "admin_order_notification",
      "d7c7b754_9f04_41ef_a1c2_e61f103806b5", // namespace
      components,
      createdOrder.orderId,
      "admin_notification",
      logMessage
    );
  } catch (error) {
    console.error("❌ sendAdminNewOrder error:", error);
    // Never throw — fire and forget
  }
}

// ═════════════════════════════════════════════════════════════
// 3. CUSTOMER — Order Confirmed (on status → Accepted)
//    Uses MSG91 "order_approved" template
// ═════════════════════════════════════════════════════════════
export async function sendCustomerOrderConfirmed(populatedOrder: any) {
  try {
    // Extract customer phone number
    const customerPhone =
      populatedOrder.userId?.phone || populatedOrder.delivery_address?.mobile;

    if (!customerPhone) {
      console.warn(
        "⚠️ Customer phone not found. Skipping order confirmed WhatsApp."
      );
      return;
    }

    const normalizedPhone = normalizePhone(customerPhone);

    const customerName =
      populatedOrder.userId?.fname && populatedOrder.userId?.lname
        ? `${populatedOrder.userId.fname} ${populatedOrder.userId.lname}`
        : "Customer";

    const productName = getFirstProductName(populatedOrder.products);
    const amount = `₹${populatedOrder.totalAmt}`;

    // Template components matching the perfect user template (using body_1, body_2 format)
    const components = {
      body_1: {
        type: "text",
        value: customerName,
      },
      body_2: {
        type: "text",
        value: populatedOrder.orderId,
      },
      body_3: {
        type: "text",
        value: productName,
      },
      body_4: {
        type: "text",
        value: amount,
      },
      body_5: {
        type: "text",
        value: "Alpha Art & Events", // Adding a 5th variable default
      },
    };

    // Log message for WhatsApp logs (human-readable summary)
    const logMessage = `✅ Order Confirmed! Hello ${customerName}, your order #${populatedOrder.orderId} for ${productName} (₹${amount}) has been confirmed. [Template: order_approved_new]`;

    await sendWhatsAppTemplateMessage(
      normalizedPhone,
      "order_approved_new",
      "d7c7b754_9f04_41ef_a1c2_e61f103806b5",
      components,
      populatedOrder.orderId,
      "customer_confirmation",
      logMessage
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

  const orderId = log.orderId;
  if (!orderId) {
    throw new Error("Cannot resend this message because it is not associated with an orderId.");
  }

  const populatedOrder = await OrderModel.findOne({ orderId })
    .populate({ path: "userId", model: UserModel, select: "fname lname phone email" })
    .populate({ path: "delivery_address", model: AddressModel, select: "address_line city state pincode country mobile" })
    .lean();

  if (!populatedOrder) {
    throw new Error("Order associated with this log not found");
  }

  // listItems can be reconstructed from populatedOrder.products
  // The service uses item.product_details?.name and item.product_details?.price which are saved in the order
  const listItems = populatedOrder.products || [];

  // Send the appropriate message based on the original log type
  switch (log.messageType) {
    case "admin_notification":
      await sendAdminNewOrder(populatedOrder, listItems);
      break;
    case "customer_order_received":
      await sendCustomerOrderReceived(populatedOrder, listItems);
      break;
    case "customer_confirmation":
      await sendCustomerOrderConfirmed(populatedOrder);
      break;
    default:
      throw new Error(`Unknown messageType: ${log.messageType}`);
  }

  return { success: true, message: "WhatsApp message resend triggered successfully" };
}
