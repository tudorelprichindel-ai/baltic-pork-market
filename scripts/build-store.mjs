import fs from "node:fs/promises";
import { generatedFiles, renderPage } from "../admin/shared.mjs";
const store = JSON.parse(await fs.readFile("data/store.json", "utf8"));
for (const [file, content] of Object.entries(generatedFiles(store))) await fs.writeFile(file, content);
for (const page of store.pages) await fs.writeFile(page.file, renderPage(await fs.readFile(page.file, "utf8"), page, store.site, "admin-1"));
console.log("Storefront generated and validated.");
