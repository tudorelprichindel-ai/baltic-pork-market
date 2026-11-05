import readline from "node:readline";
import { passwordHash } from "./service.mjs";
if (!process.stdin.isTTY) { console.error("Run in an interactive terminal. Passwords are never accepted as command arguments."); process.exit(1); }
const input = readline.createInterface({ input: process.stdin, output: process.stdout });
process.stdout.write("New admin passphrase (at least 16 characters; input hidden): ");
input._writeToOutput = () => {};
const password = await new Promise((resolve) => input.once("line", resolve)); input.close();
if (password.length < 16 || password.length > 256) { console.error("\nUse 16–256 characters."); process.exit(1); }
const { writeFile, mkdir } = await import("node:fs/promises");
await mkdir("outputs/admin-secrets", { recursive: true });
await writeFile("outputs/admin-secrets/password-hash.txt", await passwordHash(password));
console.log("\nHash saved in outputs/admin-secrets/password-hash.txt (ignored by Git). Use wrangler secret put ADMIN_PASSWORD_HASH with this file as standard input.");
