import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@teesandhoodies.com";
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Tees & Hoodies Orders <onboarding@resend.dev>";
const replyToEmail = Deno.env.get("RESEND_REPLY_TO_EMAIL") || "hello@teesandhoodies.com";
const hubtelSmsUrl = Deno.env.get("HUBTEL_SMS_URL") || "https://sms.hubtel.com/v1/messages/send";
const hubtelClientId = Deno.env.get("HUBTEL_CLIENT_ID");
const hubtelClientSecret = Deno.env.get("HUBTEL_CLIENT_SECRET");
const hubtelSenderId = Deno.env.get("HUBTEL_SENDER_ID") || "SmartAscend";
const adminPhoneNumber = Deno.env.get("ADMIN_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OrderType = "store" | "custom";

type StoreOrderItem = {
  product_name?: string;
  size?: string;
  color?: string;
  quantity?: number;
  unit_price?: number;
};

type OrderRecord = {
  id?: string;
  customer_name?: string;
  email?: string;
  phone_number?: string;
  total?: number;
  shipping_address?: string;
  shipping_city?: string;
  payment_method?: string;
  payment_status?: string;
  product_type?: string;
  quantity?: number;
  delivery_location?: string;
  print_placement?: string;
  order_items?: StoreOrderItem[];
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(value: unknown) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? `GHC ${amount.toFixed(2)}` : "GHC 0.00";
}

function storeItemsHtml(items: StoreOrderItem[] = []) {
  if (items.length === 0) {
    return "<p>No line items were supplied.</p>";
  }

  return `
    <ul>
      ${items
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.quantity ?? 0)}x ${escapeHtml(item.product_name || "Product")}</strong>
              - ${escapeHtml(item.size || "N/A")} / ${escapeHtml(item.color || "N/A")}
              at ${money(item.unit_price)}
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
}

function buildAdminEmail(orderType: OrderType, record: OrderRecord) {
  const orderCode = record.id ? record.id.slice(0, 8).toUpperCase() : "NEW";
  const customerName = record.customer_name || "Customer";

  if (orderType === "custom") {
    return {
      subject: `New Custom Order: ${record.quantity ?? ""}x ${record.product_type ?? "Product"} for ${customerName}`,
      html: `
        <h2>New Custom Order Received</h2>
        <p><strong>Reference:</strong> ${escapeHtml(orderCode)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(record.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(record.phone_number)}</p>
        <p><strong>Product:</strong> ${escapeHtml(record.quantity)}x ${escapeHtml(record.product_type)}</p>
        <p><strong>Location:</strong> ${escapeHtml(record.delivery_location)}</p>
        <p><strong>Placement:</strong> ${escapeHtml(record.print_placement)}</p>
        <p>Log in to the store dashboard to view full details and uploaded files.</p>
      `,
    };
  }

  return {
    subject: `New Store Order ${orderCode}: ${money(record.total)} from ${customerName}`,
    html: `
      <h2>New Store Order Received</h2>
      <p><strong>Order:</strong> ${escapeHtml(orderCode)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(record.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(record.phone_number)}</p>
      <p><strong>Delivery:</strong> ${escapeHtml(record.shipping_address)}, ${escapeHtml(record.shipping_city)}</p>
      <p><strong>Payment method:</strong> ${escapeHtml(record.payment_method)}</p>
      <p><strong>Payment status:</strong> ${escapeHtml(record.payment_status)}</p>
      <p><strong>Total:</strong> ${money(record.total)}</p>
      <h3>Items</h3>
      ${storeItemsHtml(record.order_items)}
      <p>Log in to the store dashboard to view full details.</p>
    `,
  };
}

function buildSmsMessage(orderType: OrderType, record: OrderRecord) {
  const orderCode = record.id ? record.id.slice(0, 8).toUpperCase() : "NEW";
  const customerName = record.customer_name || "Customer";

  if (orderType === "custom") {
    return `New custom order ${orderCode}: ${record.quantity ?? ""}x ${record.product_type ?? "Product"} from ${customerName}. Call ${record.phone_number || "N/A"}.`;
  }

  return `New order ${orderCode}: ${money(record.total)} from ${customerName}. ${record.payment_method || "Payment N/A"}. Call ${record.phone_number || "N/A"}.`;
}

async function sendHubtelSms(message: string) {
  if (!hubtelClientId || !hubtelClientSecret || !adminPhoneNumber) {
    return { skipped: true, reason: "Missing Hubtel SMS secrets" };
  }

  const url = new URL(hubtelSmsUrl);
  url.search = new URLSearchParams({
    clientid: hubtelClientId,
    clientsecret: hubtelClientSecret,
    from: hubtelSenderId,
    to: adminPhoneNumber,
    content: message,
  }).toString();

  const response = await fetch(url.toString(), { method: "GET" });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Hubtel SMS failed: ${response.status} ${text}`);
  }

  return { skipped: false, response: text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const orderType = (payload.orderType === "store" ? "store" : "custom") as OrderType;
    const record = payload.record as OrderRecord | undefined;

    if (!record) {
      throw new Error("No order record found in payload");
    }

    const adminEmailBody = buildAdminEmail(orderType, record);
    const smsMessage = buildSmsMessage(orderType, record);
    const adminResponse = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      reply_to: replyToEmail,
      subject: adminEmailBody.subject,
      html: adminEmailBody.html,
    });
    let smsResponse: Awaited<ReturnType<typeof sendHubtelSms>> | null = null;
    let smsError: string | null = null;

    try {
      smsResponse = await sendHubtelSms(smsMessage);
    } catch (error: any) {
      smsError = error.message || "Hubtel SMS failed";
      console.error("Hubtel SMS notification failed:", error);
    }

    return new Response(JSON.stringify({ ok: true, adminResponse, smsResponse, smsError }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("notify-order error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
