import { AppError, generatedFiles, renderPage } from "./shared.mjs";
const encoder = new TextEncoder();
export function base64(bytes) { let str = ""; for (let i = 0; i < bytes.length; i += 8192) str += String.fromCharCode(...bytes.subarray(i, i + 8192)); return btoa(str); }
export function unbase64(str) { return Uint8Array.from(atob(str), (c) => c.charCodeAt(0)); }
const url64 = (bytes) => base64(bytes).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
export class GitHubRepository {
  constructor(env) { this.env = env; this.repo = env.GITHUB_REPOSITORY; this.branch = env.GITHUB_BRANCH || "main"; }
  async token() {
    if (this.env.GITHUB_TOKEN) return this.env.GITHUB_TOKEN;
    if (this.installationToken && this.tokenExpires > Date.now() + 60000) return this.installationToken;
    if (!this.env.GITHUB_APP_ID || !this.env.GITHUB_INSTALLATION_ID || !this.env.GITHUB_APP_PRIVATE_KEY) throw new AppError("Saglabāšana vēl nav pieslēgta. Sazinieties ar vietnes uzturētāju.", 503);
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${url64(encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })))}.${url64(encoder.encode(JSON.stringify({ iat: now - 60, exp: now + 540, iss: this.env.GITHUB_APP_ID })))}`;
    const pem = this.env.GITHUB_APP_PRIVATE_KEY.replaceAll("\\n", "\n").replace(/-----[^-]+-----|\s/g, "");
    const key = await crypto.subtle.importKey("pkcs8", unbase64(pem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
    const jwt = `${unsigned}.${url64(new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(unsigned))))}`;
    const result = await this.request(`/app/installations/${this.env.GITHUB_INSTALLATION_ID}/access_tokens`, { method: "POST", body: JSON.stringify({ repositories: [this.repo.split("/")[1]], permissions: { contents: "write" } }) }, jwt);
    this.installationToken = result.token; this.tokenExpires = Date.parse(result.expires_at);
    return this.installationToken;
  }
  async request(path, options = {}, explicitToken) {
    const response = await fetch(`https://api.github.com${path}`, { ...options, signal: AbortSignal.timeout(15000), headers: { Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "Galas-grozs-administration", Authorization: `Bearer ${explicitToken || await this.token()}` } });
    if (!response.ok) throw new AppError(response.status === 409 || response.status === 422 ? "Vietne pa šo laiku ir mainīta citur. Atjaunojiet datus un pārskatiet izmaiņas." : "Neizdevās sazināties ar vietnes glabātuvi. Melnraksts ir drošībā; mēģiniet vēlreiz vai sazinieties ar uzturētāju.", response.status === 409 || response.status === 422 ? 409 : 502);
    return response.status === 204 ? null : response.json();
  }
  async head() { return (await this.request(`/repos/${this.repo}/git/ref/heads/${this.branch}`)).object.sha; }
  async read(path, sha) {
    let data = await this.request(`/repos/${this.repo}/contents/${path}?ref=${sha || this.branch}`);
    if (data.encoding !== "base64") data = await this.request(`/repos/${this.repo}/git/blobs/${data.sha}`);
    if (data.encoding !== "base64") throw new AppError("Fails ir pārāk liels.", 502);
    return unbase64(data.content.replace(/\s/g, ""));
  }
  async load() { const sha = await this.head(); return { sha, store: JSON.parse(new TextDecoder().decode(await this.read("data/store.json", sha))) }; }
  async publish(store, expectedSha, uploads) {
    const head = await this.head();
    if (head !== expectedSha) throw new AppError("Vietne ir mainīta ārpus paneļa. Vispirms lejupielādējiet melnrakstu un atjaunojiet datus sadaļā Versijas.", 409);
    const files = generatedFiles(store);
    const revision = `p${Date.now()}`;
    for (const page of store.pages) files[page.file] = renderPage(new TextDecoder().decode(await this.read(page.file, head)), page, store.site, revision);
    const parent = await this.request(`/repos/${this.repo}/git/commits/${head}`);
    const tree = Object.entries(files).map(([path, content]) => ({ path, mode: "100644", type: "blob", content }));
    for (const upload of uploads) {
      const blob = await this.request(`/repos/${this.repo}/git/blobs`, { method: "POST", body: JSON.stringify({ content: upload.base64, encoding: "base64" }) });
      tree.push({ path: upload.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const newTree = await this.request(`/repos/${this.repo}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
    const commit = await this.request(`/repos/${this.repo}/git/commits`, { method: "POST", body: JSON.stringify({ message: "Update website from administration panel", tree: newTree.sha, parents: [head] }) });
    await this.request(`/repos/${this.repo}/git/refs/heads/${this.branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
    return commit.sha;
  }
}
