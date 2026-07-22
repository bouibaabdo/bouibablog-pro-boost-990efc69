/**
 * Bouiba Academy — Meta Facebook Permanent Token Generator
 * 
 * Usage:
 *   node scripts/generate-permanent-token.js <APP_SECRET> <SHORT_USER_TOKEN>
 * 
 * Explanation:
 *   1. Exchanges Short-Lived User Token for 60-Day Long-Lived User Token.
 *   2. Queries Meta Graph API for Page Access Token using the 60-Day Token.
 *   3. Resulting Page Access Token NEVER EXPIRES (Permanent / Unlimited ♾️)!
 */

import fetch from "node-fetch";

const APP_ID = "984917824596845";
const PAGE_ID = "559362324530470";

async function main() {
  const args = process.argv.slice(2);
  const appSecret = args[0];
  const shortToken = args[1];

  if (!appSecret || !shortToken) {
    console.log("=========================================");
    console.log("🛠️  Meta Permanent Page Access Token Generator");
    console.log("=========================================\n");
    console.log("طريقة الاستخدام (Usage):");
    console.log("  node scripts/generate-permanent-token.js <APP_SECRET> <SHORT_USER_TOKEN>\n");
    console.log("📌 الخطوات للحصول على المفاتيح من Meta:");
    console.log("  1. افتح https://developers.facebook.com/apps/984917824596845/settings/basic/");
    console.log("  2. انسخ App Secret (مفتاح التطبيق السرّي).");
    console.log("  3. افتح https://developers.facebook.com/tools/explorer/");
    console.log("  4. انسخ User Access Token الحالي.");
    console.log("  5. شغّل الأمر أعلاه للتحويل إلى توكن دائم 100% لا ينتهي أبداً (Never Expiring)!");
    return;
  }

  console.log("=========================================");
  console.log("🚀 Exchanging Token for Permanent Page Access Token...");
  console.log("=========================================\n");

  try {
    // Step 1: Exchange Short-Lived User Token for Long-Lived User Token (60 Days)
    const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;
    const longRes = await fetch(longTokenUrl);
    const longData = await longRes.json();

    if (!longRes.ok || longData.error) {
      throw new Error(longData.error?.message || "فشل الحصول على Long-Lived User Token");
    }

    const longLivedUserToken = longData.access_token;
    console.log("✅ Step 1: 60-Day Long-Lived User Token Generated!");

    // Step 2: Fetch Permanent Page Access Token (Never Expiring ♾️)
    const pageTokenUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}?fields=access_token,name&access_token=${longLivedUserToken}`;
    const pageRes = await fetch(pageTokenUrl);
    const pageData = await pageRes.json();

    if (!pageRes.ok || pageData.error || !pageData.access_token) {
      throw new Error(pageData.error?.message || "فشل استخراج Page Token الدائم");
    }

    const permanentPageToken = pageData.access_token;

    console.log("\n=========================================");
    console.log(`🎉 PERMANENT PAGE ACCESS TOKEN GENERATED (Never Expiring ♾️)!`);
    console.log(`📌 Page Name: ${pageData.name || "Bouiba Academy"}`);
    console.log(`📌 Page ID: ${PAGE_ID}`);
    console.log("\n🔑 Permanent Token (ضع هذا التوكن الدائم في .env وفي لوحة التحكم):\n");
    console.log(permanentPageToken);
    console.log("\n=========================================\n");
  } catch (err) {
    console.error("❌ Error generating permanent token:", err.message);
  }
}

main();
