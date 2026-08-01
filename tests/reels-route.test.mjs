import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("reels tool route and API prompt are wired", () => {
  // 1. Route page exists
  const routePath = path.join(root, "src", "routes", "tools.reels.tsx");
  assert.ok(fs.existsSync(routePath), "expected tools.reels.tsx route file");

  // 2. Text API handler contains reels action
  const apiPath = path.join(root, "src", "routes", "api", "tools", "text.ts");
  const api = fs.readFileSync(apiPath, "utf8");
  assert.match(api, /\| "reels"/, "expected reels action in text API Action union");
  assert.match(api, /reels: \(\) =>/, "expected reels prompt handler in text API SYSTEM map");

  // 3. Page component uses action="reels"
  const page = fs.readFileSync(routePath, "utf8");
  assert.match(page, /action="reels"/, "expected action=reels in tools.reels.tsx");

  // 4. Site header includes reels nav link
  const headerPath = path.join(root, "src", "components", "site-header.tsx");
  const header = fs.readFileSync(headerPath, "utf8");
  assert.match(header, /to: "\/tools\/reels"/, "expected reels link in site-header");

  // 5. Tools index includes reels card
  const indexPath = path.join(root, "src", "routes", "tools.index.tsx");
  const index = fs.readFileSync(indexPath, "utf8");
  assert.match(index, /\/tools\/reels/, "expected reels link in tools.index");
});
