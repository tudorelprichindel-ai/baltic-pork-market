import { AppError, validateStore, changesBetween, assertImage, safeImagePath, generatedFiles, renderPage } from "./shared.mjs";
import { base64 } from "./github.mjs";
const encode = new TextEncoder();
const hex = (bytes) => Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
export const hash = async (value) => hex(await crypto.subtle.digest("SHA-256", encode.encode(value)));
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
async function readLimited(req, max) {
  if (Number(req.headers.get("Content-Length")) > max) throw new AppError("Pārāk daudz datu.", 413);
  const reader = req.body?.getReader(); if (!reader) return new Uint8Array();
  const chunks = []; let size = 0;
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > max) { await reader.cancel(); throw new AppError("Pārāk daudz datu.", 413); } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; } return bytes;
}
export const json = (value, status = 200, extra = {}) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra } });
export async function passwordHash(password, salt = random()) {
  const key = await crypto.subtle.importKey("raw", encode.encode(password), "PBKDF2", false, ["deriveBits"]);
  const result = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: encode.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return `pbkdf2:100000:${salt}:${hex(result)}`;
}
async function passwordMatches(password, saved) {
  if (!/^pbkdf2:100000:[a-f0-9]{64}:[a-f0-9]{64}$/.test(saved || "")) return false;
  const actual = await passwordHash(password, saved.split(":")[2]);
  let diff = 0; for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ saved.charCodeAt(i);
  return diff === 0;
}
export class AdminService {
  constructor(env, storage, repo) { this.env = env; this.db = storage; this.repo = repo; this.queue = Promise.resolve(); }
  async serial(fn) {
    const result = this.queue.then(fn, fn); this.queue = result.catch(() => {}); return result;
  }
  async body(req, max = 300000) {
    if (!req.headers.get("Content-Type")?.includes("application/json")) throw new AppError("Nederīgs pieprasījums.", 415);
    const raw = new TextDecoder().decode(await readLimited(req, max * 4)); if (raw.length > max) throw new AppError("Pārāk daudz datu.", 413);
    try { return JSON.parse(raw); } catch { throw new AppError("Nederīgi dati."); }
  }
  async state() {
    let state = await this.db.get("state");
    if (!state) {
      const loaded = await this.repo.load(); validateStore(loaded.store);
      state = { draft: loaded.store, published: loaded.store, head: loaded.sha, revision: 1, updatedAt: new Date().toISOString(), history: [{ id: random().slice(0,16), at: new Date().toISOString(), store: loaded.store, sha: loaded.sha, changes: ["Sākotnējā versija"] }], deployment: null };
      await this.db.put("state", state);
    }
    return state;
  }
  publicState(state) { return { store: state.draft, revision: state.revision, updatedAt: state.updatedAt, changes: changesBetween(state.published, state.draft), history: state.history.map(({ store, ...version }) => version), deployment: state.deployment, local: this.env.LOCAL_MODE === "1", publicUrl: this.env.PUBLIC_SITE_URL }; }
  async activePasswordHash() { const saved = await this.db.get("password"); return saved?.baseHash === this.env.ADMIN_PASSWORD_HASH ? saved.hash : this.env.ADMIN_PASSWORD_HASH; }
  async fetch(req) {
    try {
      const url = new URL(req.url);
      const path = url.pathname;
      if (!this.env.ADMIN_USER || !this.env.ADMIN_PASSWORD_HASH) throw new AppError("Administrēšanas piekļuve vēl nav konfigurēta. Sazinieties ar vietnes uzturētāju.", 503);
      if (!["GET", "HEAD"].includes(req.method) && req.headers.get("Origin") !== url.origin) throw new AppError("Atveriet paneli no jauna un mēģiniet vēlreiz.", 403);
      if (path === "/api/login" && req.method === "POST") return await this.serial(async () => {
        const body = await this.body(req, 2000);
        const now = Date.now();
        const ipKey = `rate-${await hash(req.headers.get("CF-Connecting-IP") || "local")}`;
        const attempts = (await this.db.get(ipKey) || []).filter((at) => at > now - 900000);
        const globalAttempts = (await this.db.get("global-rate") || []).filter((at) => at > now - 900000);
        if (attempts.length >= 5 || globalAttempts.length >= 100) throw new AppError("Pārāk daudz mēģinājumu. Mēģiniet pēc 15 minūtēm.", 429);
        if (typeof body.password !== "string" || body.password.length > 256 || body.username !== this.env.ADMIN_USER || !await passwordMatches(body.password, await this.activePasswordHash())) {
          await this.db.put(ipKey, [...attempts, now]); await this.db.put("global-rate", [...globalAttempts, now]);
          throw new AppError("Nepareizs lietotājvārds vai parole.", 401);
        }
        await this.db.delete(ipKey);
        const token = random(); await this.db.put(`session-${await hash(token)}`, { expires: now + 8 * 3600000, epoch: await this.db.get("session-epoch") || 0, credentialVersion: await hash(`${this.env.ADMIN_PASSWORD_HASH}:${this.env.SESSION_VERSION || "1"}`) });
        return json({ ok: true }, 200, { "Set-Cookie": `gg_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${url.protocol === "https:" ? "; Secure" : ""}` });
      });
      const token = req.headers.get("Cookie")?.match(/(?:^|;\s*)gg_session=([a-f0-9]{64})(?:;|$)/)?.[1];
      const sessionKey = token ? `session-${await hash(token)}` : "none";
      const session = token && await this.db.get(sessionKey);
      if (!session || session.expires < Date.now() || session.epoch !== (await this.db.get("session-epoch") || 0) || session.credentialVersion !== await hash(`${this.env.ADMIN_PASSWORD_HASH}:${this.env.SESSION_VERSION || "1"}`)) { if (session) await this.db.delete(sessionKey); throw new AppError("Lūdzu, pieslēdzieties vēlreiz.", 401); }
      if (path === "/api/logout" && req.method === "POST") { await this.db.delete(sessionKey); return json({ ok: true }, 200, { "Set-Cookie": "gg_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure" }); }
      if (path === "/api/session") return json({ username: this.env.ADMIN_USER, local: this.env.LOCAL_MODE === "1" });
      if (path === "/api/password" && req.method === "POST") return await this.serial(async () => {
        const body = await this.body(req, 3000);
        if (typeof body.password !== "string" || !await passwordMatches(body.password, await this.activePasswordHash())) throw new AppError("Pašreizējā parole nav pareiza.", 403);
        if (typeof body.newPassword !== "string" || body.newPassword.length < 16 || body.newPassword.length > 256) throw new AppError("Jaunajai parolei jābūt 16–256 rakstzīmes garai.");
        await this.db.put("password", { baseHash: this.env.ADMIN_PASSWORD_HASH, hash: await passwordHash(body.newPassword) });
        await this.db.put("session-epoch", (await this.db.get("session-epoch") || 0) + 1);
        return json({ ok: true }, 200, { "Set-Cookie": "gg_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure" });
      });
      if (path === "/api/state" && req.method === "GET") return json(this.publicState(await this.serial(() => this.state())));
      if (path.startsWith("/api/image/") && req.method === "GET") {
        const name = path.slice(11);
        if (!/^[a-z0-9-]+\.(jpg|png|webp)$/.test(name)) throw new AppError("Attēls nav atrasts.", 404);
        const upload = await this.readUpload(`assets/products/${name}`);
        if (upload) return new Response(Uint8Array.from(atob(upload.base64), (c) => c.charCodeAt(0)), { headers: { "Content-Type": upload.type, "Cache-Control": "private, max-age=3600" } });
        const state = await this.state();
        return new Response(await this.repo.read(`assets/products/${name}`, state.head), { headers: { "Content-Type": `image/${name.endsWith("jpg") ? "jpeg" : name.split(".").pop()}`, "Cache-Control": "private, max-age=3600" } });
      }
      if (path.startsWith("/preview/") && req.method === "GET") return await this.preview(path.slice(9));
      if (path === "/api/status" && req.method === "GET") {
        const state = await this.state(); let live = false;
        if (this.env.LOCAL_MODE === "1") return json({ live: false, local: true, deployment: state.deployment });
        try {
          const response = await fetch(`${this.env.PUBLIC_SITE_URL}/data/store.json?check=${Date.now()}`, { signal: AbortSignal.timeout(8000), cache: "no-store" });
          live = response.ok && JSON.stringify(await response.json()) === JSON.stringify(state.published);
        } catch { /* The client can retry without losing the draft. */ }
        return json({ live, deployment: state.deployment });
      }
      if (path === "/api/export" && req.method === "GET") return json((await this.state()).draft, 200, { "Content-Disposition": 'attachment; filename="galas-grozs-melnraksts.json"' });
      return await this.serial(async () => {
        const state = await this.state();
        if (path === "/api/upload" && req.method === "POST") {
          const type = req.headers.get("Content-Type");
          if (Number(req.headers.get("Content-Length")) > 900000) throw new AppError("Attēls ir pārāk liels.", 413);
          const bytes = await readLimited(req, 900000); const ext = assertImage(bytes, type);
          const paths = await this.db.get("uploads") || [];
          if (paths.length >= 100) throw new AppError("Pārāk daudz nepublicētu attēlu. Publicējiet izmaiņas vai sazinieties ar uzturētāju.");
          const imagePath = `assets/products/admin-${random().slice(0,24)}.${ext}`;
          const encoded = base64(bytes);
          const chunks = Math.ceil(encoded.length / 60000);
          for (let i = 0; i < chunks; i++) await this.db.put(`${imagePath}:${i}`, encoded.slice(i * 60000, (i + 1) * 60000));
          await this.db.put(imagePath, { chunks, type }); await this.db.put("uploads", [...paths, imagePath]);
          return json({ path: imagePath });
        }
        if (req.method !== "POST") throw new AppError("Lapa nav atrasta.", 404);
        const body = await this.body(req);
        if (body.revision !== state.revision) throw new AppError("Melnraksts mainīts citā logā. Lejupielādējiet savas izmaiņas un atjaunojiet lapu.", 409);
        if (path === "/api/draft") {
          state.draft = validateStore(body.store);
          // Reject invented image paths before accepting a new product.
          const known = new Set([...state.published.catalog.products.map((p) => p.image), ...state.history.flatMap((v) => v.store.catalog.products.map((p) => p.image)), ...(await this.db.get("uploads") || [])]);
          for (const p of state.draft.catalog.products) if (!known.has(p.image)) throw new AppError(`${p.name.lv}: fotogrāfija nav augšupielādēta.`);
          const originalIds = state.published.catalog.products.map((p) => p.id);
          if (originalIds.some((id) => !state.draft.catalog.products.some((p) => p.id === id))) throw new AppError("Produktus nedzēš. Izvēlieties statusu “Paslēpts”.");
        } else if (path === "/api/restore") {
          const previous = state.history.find((v) => v.id === body.id);
          if (!previous) throw new AppError("Versija nav atrasta.", 404);
          state.draft = structuredClone(previous.store);
          for (const product of state.published.catalog.products) if (!state.draft.catalog.products.some((p) => p.id === product.id)) state.draft.catalog.products.push({ ...product, active: false });
          for (const product of state.draft.catalog.products) if (!state.draft.catalog.categories.some((c) => c.id === product.category)) state.draft.catalog.categories.push({ ...state.published.catalog.categories.find((c) => c.id === product.category), active: false });
        } else if (path === "/api/discard") state.draft = state.published;
        else if (path === "/api/refresh") {
          const loaded = await this.repo.load(); validateStore(loaded.store);
          state.published = loaded.store; state.draft = loaded.store; state.head = loaded.sha;
          state.deployment = null;
        } else if (path === "/api/publish") {
          validateStore(state.draft);
          const changes = changesBetween(state.published, state.draft);
          if (!changes.length) throw new AppError("Nav jaunu izmaiņu, ko publicēt.");
          const uploadPaths = new Set(state.draft.catalog.products.map((p) => p.image));
          const uploads = [];
          for (const p of uploadPaths) { const upload = await this.readUpload(p); if (upload) uploads.push(upload); }
          const sha = await this.repo.publish(state.draft, state.head, uploads);
          state.head = sha; state.published = state.draft;
          state.deployment = { sha, at: new Date().toISOString(), local: this.env.LOCAL_MODE === "1" };
          state.history.unshift({ id: random().slice(0,16), at: state.deployment.at, sha, changes, store: state.draft });
          state.history = state.history.slice(0, 20);
        } else throw new AppError("Lapa nav atrasta.", 404);
        state.revision++; state.updatedAt = new Date().toISOString();
        await this.db.put("state", state);
        if (path === "/api/publish" || path === "/api/discard") {
          const paths = await this.db.get("uploads") || [];
          for (const path of paths) { const meta = await this.db.get(path); if (meta) for (let i = 0; i < meta.chunks; i++) await this.db.delete(`${path}:${i}`); await this.db.delete(path); }
          await this.db.put("uploads", []);
        }
        return json(this.publicState(state));
      });
    } catch (error) {
      if (!(error instanceof AppError)) console.error("Admin request failed", error?.name);
      return json({ error: error instanceof AppError ? error.message : "Darbību neizdevās pabeigt. Melnraksts nav zaudēts. Mēģiniet vēlreiz." }, error.status || 500);
    }
  }
  async readUpload(path) {
    if (!safeImagePath(path)) return null;
    const meta = await this.db.get(path); if (!meta) return null;
    let content = ""; for (let i = 0; i < meta.chunks; i++) content += await this.db.get(`${path}:${i}`);
    return { path, type: meta.type, base64: content };
  }
  async preview(path) {
    if (!/^(?:[a-z0-9-]+\.(?:html|png|jpg|webp|svg)|(?:assets|css|js|data)\/[a-zA-Z0-9_./-]+)$/.test(path) || path.includes("..")) throw new AppError("Fails nav atrasts.", 404);
    const state = await this.state();
    const generated = generatedFiles(state.draft);
    let content; const upload = await this.readUpload(path);
    if (upload) content = Uint8Array.from(atob(upload.base64), (c) => c.charCodeAt(0));
    else if (generated[path]) content = generated[path];
    else content = await this.repo.read(path, state.head);
    const page = state.draft.pages.find((p) => p.file === path);
    if (page) content = renderPage(new TextDecoder().decode(content), page, state.draft.site, `draft${state.revision}`).replace("<head>", '<head><meta name="robots" content="noindex,nofollow">');
    const ext = path.split(".").pop();
    const type = { html: "text/html", js: "text/javascript", mjs: "text/javascript", css: "text/css", json: "application/json", svg: "image/svg+xml", jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[ext] || "application/octet-stream";
    return new Response(content, { headers: { "Content-Type": `${type}${type.startsWith("text") ? "; charset=utf-8" : ""}`, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
}
