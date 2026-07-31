import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("tempmail tool route and API handler are wired", () => {
  // 1. Route page exists
  const routePath = path.join(root, "src", "routes", "tools.tempmail.tsx");
  assert.ok(fs.existsSync(routePath), "expected tools.tempmail.tsx route file");

  // 2. Server API handler exists
  const apiPath = path.join(root, "src", "routes", "api", "tools", "tempmail.ts");
  assert.ok(fs.existsSync(apiPath), "expected api/tools/tempmail.ts server file");

  // 3. API handler has POST + GET methods
  const api = fs.readFileSync(apiPath, "utf8");
  assert.match(api, /POST:/, "expected POST handler");
  assert.match(api, /GET:/, "expected GET handler");
  assert.match(api, /action === "inbox"/, "expected inbox action");
  assert.match(api, /action === "message"/, "expected message action");
  assert.match(api, /action === "delete"/, "expected delete action");

  // 4. Page has /api/tools/tempmail fetch call
  const page = fs.readFileSync(routePath, "utf8");
  assert.match(page, /\/api\/tools\/tempmail/, "expected API fetch in page");
  assert.match(page, /sanitizeHtml/, "expected HTML sanitization");

  // 5. Site header includes tempmail nav link
  const headerPath = path.join(root, "src", "components", "site-header.tsx");
  const header = fs.readFileSync(headerPath, "utf8");
  assert.match(header, /to: "\/tools\/tempmail"/, "expected tempmail link in site-header");

  // 6. Tools index includes tempmail card
  const indexPath = path.join(root, "src", "routes", "tools.index.tsx");
  const index = fs.readFileSync(indexPath, "utf8");
  assert.match(index, /\/tools\/tempmail/, "expected tempmail link in tools.index");
});
