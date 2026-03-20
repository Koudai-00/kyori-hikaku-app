import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateInquiryNumber(): string {
  return `INQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function sendLineNotification(data: {
  inquiryNumber: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string;
}): Promise<boolean> {
  try {
    const accessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
    if (!accessToken) return false;

    const message = `【新しいお問い合わせ】
問い合わせ番号: ${data.inquiryNumber}
日時: ${new Date(data.createdAt).toLocaleString("ja-JP")}
お名前: ${data.name}
件名: ${data.subject}
メールアドレス: ${data.email}

管理画面で詳細を確認してください。`;

    const response = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [{ type: "text", text: message }] }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "必須項目が入力されていません" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length < 10) {
      return new Response(
        JSON.stringify({ success: false, message: "お問い合わせ内容は10文字以上で入力してください" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: "正しいメールアドレスを入力してください" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const inquiryNumber = generateInquiryNumber();
    const now = new Date().toISOString();

    const { data: contact, error } = await supabase
      .from("contacts")
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        inquiry_number: inquiryNumber,
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return new Response(
        JSON.stringify({ success: false, message: "お問い合わせの保存に失敗しました" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await sendLineNotification({
      inquiryNumber,
      name,
      email,
      subject,
      createdAt: now,
    });

    return new Response(
      JSON.stringify({ success: true, inquiryNumber, logged: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Contact function error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "お問い合わせの送信に失敗しました" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
