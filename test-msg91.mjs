// Test MSG91 WhatsApp Template API 

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER;
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER;

console.log("=== MSG91 Config ===");
console.log("AUTH_KEY:", MSG91_AUTH_KEY ? `${MSG91_AUTH_KEY.slice(0, 8)}...` : "❌ MISSING");
console.log("WHATSAPP_NUMBER:", MSG91_WHATSAPP_NUMBER || "❌ MISSING");
console.log("ADMIN_NUMBER:", ADMIN_WHATSAPP_NUMBER || "❌ MISSING");
console.log("");

// Test with new_order_admin template
const payload = {
  integrated_number: MSG91_WHATSAPP_NUMBER,
  content_type: "template",
  payload: {
    messaging_product: "whatsapp",
    type: "template",
    template: {
      name: "new_order_admin",
      language: {
        code: "en",
        policy: "deterministic",
      },
      namespace: null,
      to_and_components: [
        {
          to: [ADMIN_WHATSAPP_NUMBER],
          components: {
            body_1: { type: "text", value: "Test Customer" },
            body_2: { type: "text", value: "ORD-TEST01" },
            body_3: { type: "text", value: "Birthday Balloon Set" },
            body_4: { type: "text", value: "₹2500" },
            body_5: { type: "text", value: "123 Main St, Indore, MP" },
          },
        },
      ],
    },
  },
};

console.log("=== Sending new_order_admin template ===");
console.log("To:", ADMIN_WHATSAPP_NUMBER);
console.log("");

try {
  const response = await fetch(
    "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: MSG91_AUTH_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  const text = await response.text();
  console.log("=== Response ===");
  console.log("Status:", response.status, response.statusText);
  console.log("Body:", text);
} catch (err) {
  console.error("=== ERROR ===");
  console.error(err);
}
