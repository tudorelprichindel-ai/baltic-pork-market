import { AdminService } from "./service.mjs";
import { GitHubRepository } from "./github.mjs";
import { ChunkStorage } from "./storage.mjs";
export class Administration {
  constructor(ctx, env) { this.ctx = ctx; this.service = new AdminService(env, new ChunkStorage(ctx.storage), new GitHubRepository(env)); }
  async fetch(request) {
    const response = await this.service.fetch(request);
    if (new URL(request.url).pathname === "/api/login" && !await this.ctx.storage.getAlarm()) await this.ctx.storage.setAlarm(Date.now() + 3600000);
    return response;
  }
  async alarm() {
    const now = Date.now(); let remaining = false;
    for (const [key, value] of await this.ctx.storage.list({ prefix: "session-" })) if (typeof value === "object") { if (value.expires < now) await this.ctx.storage.delete(key); else remaining = true; }
    for (const [key, value] of await this.ctx.storage.list({ prefix: "rate-" })) { const active = value.filter((at) => at > now - 900000); if (!active.length) await this.ctx.storage.delete(key); else { await this.ctx.storage.put(key, active); remaining = true; } }
    if (remaining) await this.ctx.storage.setAlarm(now + 3600000);
  }
}
export default {
  async fetch(request, env) {
    if (new URL(request.url).protocol !== "https:") { const url = new URL(request.url); url.protocol = "https:"; return Response.redirect(url.href, 308); }
    const path = new URL(request.url).pathname;
    let response;
    if (path.startsWith("/api/") || path.startsWith("/preview/")) response = await env.ADMIN.get(env.ADMIN.idFromName("galas-grozs")).fetch(request);
    else response = await env.ASSETS.fetch(request);
    const secured = new Response(response.body, response);
    secured.headers.set("X-Content-Type-Options", "nosniff");
    secured.headers.set("X-Robots-Tag", "noindex, nofollow");
    secured.headers.set("Referrer-Policy", "same-origin");
    secured.headers.set("X-Frame-Options", "DENY");
    secured.headers.set("Strict-Transport-Security", "max-age=31536000");
    if (!path.startsWith("/preview/")) secured.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    return secured;
  }
};
