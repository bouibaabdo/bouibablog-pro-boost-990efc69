import { createServerFn } from "@tanstack/react-start";

interface EventPayload {
  eventName: string;
  url?: string;
  userId?: string | null;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * دالة خادم لاستقبال أحداث التحليلات وحفظها في Google BigQuery (أو قاعدة البيانات البديلة)
 */
export const logEventToServer = createServerFn({ method: "POST" })
  .validator((d: EventPayload) => d)
  .handler(async ({ data }) => {
    const { eventName, url, userId, metadata = {}, timestamp = new Date().toISOString() } = data;

    console.info(`[Analytics Event Recieved]: ${eventName}`, { url, userId, metadata, timestamp });

    // قراءة متغيرات البيئة الخاصة بـ Google Cloud BigQuery
    const projectId = process.env.BIGQUERY_PROJECT_ID;
    const clientEmail = process.env.BIGQUERY_CLIENT_EMAIL;
    const privateKey = process.env.BIGQUERY_PRIVATE_KEY;
    const datasetId = process.env.BIGQUERY_DATASET_ID || "bouibacademy_analytics";
    const tableId = process.env.BIGQUERY_TABLE_ID || "student_events";

    // إذا لم تكن إعدادات BigQuery متوفرة، سنكتفي بطباعة السجل (أو يمكن حفظه في Supabase كبديل)
    if (!projectId || !clientEmail || !privateKey) {
      console.info("[Analytics] BigQuery credentials not set. Event logged to server stdout.");
      return { success: true, fallback: "console" };
    }

    try {
      // استيراد حزمة BigQuery ديناميكياً لكي لا تسبب مشاكل في بيئات الـ Edge (مثل Cloudflare Workers)
      const { BigQuery } = await import("@google-cloud/bigquery");

      const bigquery = new BigQuery({
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, "\n"),
        },
      });

      const row = {
        event_name: eventName,
        url: url || "",
        user_id: userId || null,
        metadata: JSON.stringify(metadata),
        timestamp: timestamp,
      };

      // إدراج الحدث مباشرة في جدول BigQuery (Streaming Insert)
      await bigquery.dataset(datasetId).table(tableId).insert([row]);
      console.info(`[Analytics] Successfully streamed event "${eventName}" to BigQuery.`);
      return { success: true };
    } catch (err: any) {
      console.error("[Analytics] Error writing event to BigQuery:", err.message || err);
      // تجنب رمي خطأ لعدم تعطيل تجربة المستخدم في الواجهة الأمامية
      return { success: false, error: err.message };
    }
  });

/**
 * دالة للواجهة الأمامية (Client-side) لإرسال الأحداث وتتبع سلوك الطالب بسهولة
 */
export async function trackEvent(eventName: string, metadata?: Record<string, any>) {
  try {
    const payload: EventPayload = {
      eventName,
      url: typeof window !== "undefined" ? window.location.href : "",
      metadata,
      timestamp: new Date().toISOString(),
    };

    // استدعاء دالة الخادم بشكل آمن
    await logEventToServer({ data: payload });
  } catch (err) {
    console.warn("[Analytics Client] Failed to track event:", err);
  }
}
