import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("agent tool route and API prompt are wired", () => {
  const routePath = path.join(root, "src", "routes", "tools.agent.tsx");
  assert.ok(fs.existsSync(routePath), "expected agent route file");

  const apiPath = path.join(root, "src", "routes", "api", "tools", "text.ts");
  const api = fs.readFileSync(apiPath, "utf8");
  assert.match(api, /\| "agent"/);
  assert.match(api, /agent:\s*\(\)/);

  const headerPath = path.join(root, "src", "components", "site-header.tsx");
  const header = fs.readFileSync(headerPath, "utf8");
  assert.match(header, /to: "\/tools\/agent"/);
});
