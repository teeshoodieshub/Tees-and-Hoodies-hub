import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("CONTACT_ADMIN_EMAIL") || Deno.env.get("ADMIN_EMAIL") || "admin@teesandhoodies.com";
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Tees & Hoodies <onboarding@resend.dev>";
const fallbackReplyToEmail = Deno.env.get("CONTACT_REPLY_TO_EMAIL") || Deno.env.get("RESEND_REPLY_TO_EMAIL") || "hello@teesandhoodies.com";
const hubtelSmsUrl = Deno.env.get("HUBTEL_SMS_URL") || "https://sms.hubtel.com/v1/messages/send";
const hubtelClientId = Deno.env.get("HUBTEL_CLIENT_ID");
const hubtelClientSecret = Deno.env.get("HUBTEL_CLIENT_SECRET");
const hubtelSenderId = Deno.env.get("HUBTEL_SENDER_ID") || "SmartAscend";
const adminPhoneNumber = Deno.env.get("CONTACT_ADMIN_PHONE_NUMBER") || Deno.env.get("ADMIN_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeMessage(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, 1500);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildAdminEmail(payload: Required<Pick<ContactPayload, "name" | "email" | "message">> & ContactPayload) {
  const subject = payload.subject || `New contact message from ${payload.name}`;

  return {
    subject,
    html: `
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(payload.phone || "Not provided")}</p>
      <p><strong>Subject:</strong> ${escapeHtml(payload.subject || "No subject")}</p>
      <h3>Message</h3>
      <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
    `,
  };
}

function buildSmsMessage(payload: Required<Pick<ContactPayload, "name" | "email" | "message">> & ContactPayload) {
  const subject = payload.subject ? ` re: ${payload.subject}` : "";
  const phone = payload.phone ? ` Phone: ${payload.phone}.` : "";
  const preview = payload.message.length > 80 ? `${payload.message.slice(0, 77)}...` : payload.message;
  return `New contact${subject} from ${payload.name}.${phone} Email: ${payload.email}. ${preview}`;
}

async function sendHubtelSms(message: string) {
  if (!hubtelClientId || !hubtelClientSecret || !adminPhoneNumber) {
    throw new Error("Missing Hubtel SMS secrets");
  }

  const url = new URL(hubtelSmsUrl);
  url.search = new URLSearchParams({
    clientid: hubtelClientId,
    clientsecret: hubtelClientSecret,
    from: hubtelSenderId,
    to: adminPhoneNumber,
    content: message.slice(0, 300),
  }).toString();

  const response = await fetch(url.toString(), { method: "GET" });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Hubtel SMS failed: ${response.status} ${text}`);
  }

  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const payload = (await req.json()) as ContactPayload;
    const contactMessage = {
      name: normalizeText(payload.name, 100),
      email: normalizeText(payload.email, 255).toLowerCase(),
      phone: normalizeText(payload.phone, 40),
      subject: normalizeText(payload.subject, 140),
      message: normalizeMessage(payload.message),
    };

    if (!contactMessage.name || !contactMessage.email || !contactMessage.message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isValidEmail(contactMessage.email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const adminEmailBody = buildAdminEmail(contactMessage);
    const smsMessage = buildSmsMessage(contactMessage);
    const [emailResponse, smsResponse] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        reply_to: contactMessage.email || fallbackReplyToEmail,
        subject: adminEmailBody.subject,
        html: adminEmailBody.html,
      }),
      sendHubtelSms(smsMessage),
    ]);

    return new Response(JSON.stringify({ ok: true, emailResponse, smsResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("notify-contact error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
