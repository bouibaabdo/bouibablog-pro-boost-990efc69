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

import fs from "fs";
import path from "path";

const APP_ID = "984917824596845";
const PAGE_ID = "559362324530470";
const ENV_PATH = path.join(process.cwd(), ".env");

async function main() {
  const args = process.argv.slice(2);
  const appSecret = (args[0] || "").trim();
  const shortToken = (args[1] || "").trim();

  if (!appSecret || !shortToken) {
    console.log("=========================================");
    console.log("🛠️  Meta Permanent Page Access Token Generator");
    console.log("=========================================\n");
    console.log("طريقة الاستخدام (Usage):");
    console.log("  node scripts/generate-permanent-token.js <APP_SECRET> <SHORT_USER_TOKEN>\n");
    console.log("📌 الخطوات للحصول على المفاتيح الصحيحة من Meta:");
    console.log("  1. افتح https://developers.facebook.com/tools/explorer/");
    console.log("  2. اختر التطبيق الخاص بك (Bouiba App: 984917824596845) من القائمة العلوية.");
    console.log(
      "  3. تأكد من تفعيل الصلاحيات التالية: pages_show_list, pages_read_engagement, pages_manage_posts",
    );
    console.log("  4. اضغط Generate Access Token وانسبخ التوكن الناتج.");
    console.log(
      "  5. افتح https://developers.facebook.com/apps/984917824596845/settings/basic/ وانسبخ App Secret.",
    );
    console.log(
      "  6. شغّل الأمر أعلاه للتحويل إلى توكن دائم 100% لا ينتهي أبداً (Never Expiring)!",
    );
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
    console.log("\n🔑 Permanent Token:\n");
    console.log(permanentPageToken);
    console.log("\n=========================================\n");

    // Auto-update .env file if present
    if (fs.existsSync(ENV_PATH)) {
      let envContent = fs.readFileSync(ENV_PATH, "utf-8");
      if (envContent.includes("FACEBOOK_PAGE_ACCESS_TOKEN=")) {
        envContent = envContent.replace(
          /FACEBOOK_PAGE_ACCESS_TOKEN=.*/g,
          `FACEBOOK_PAGE_ACCESS_TOKEN=${permanentPageToken}`,
        );
      } else {
        envContent += `\nFACEBOOK_PAGE_ACCESS_TOKEN=${permanentPageToken}\n`;
      }
      fs.writeFileSync(ENV_PATH, envContent, "utf-8");
      console.log("✅ Saved Permanent Token directly to .env file!");
    }
  } catch (err) {
    console.error("❌ Error generating permanent token:", err.message);
    console.log("\n💡 سبب الخطأ المقترن بـ Meta:");
    console.log(
      "• إذا ظهر 'The access token could not be decrypted': التوكن المنسوخ قديم أو تم نسخته بشكل غير كامل، أو تم إنشاؤه من تطبيق آخر.",
    );
    console.log(
      "• يرجى زيارة https://developers.facebook.com/tools/explorer/ واختيار التطبيق 984917824596845 ثم الضغط على Generate Access Token وجلب التوكن الجديد.",
    );
  }
}

main();
