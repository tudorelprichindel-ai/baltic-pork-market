import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AdminService, passwordHash } from "./service.mjs";
import { generatedFiles, renderPage, AppError } from "./shared.mjs";
import { ChunkStorage } from "./storage.mjs";
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const directory = path.join(root,"outputs","admin-local");
await fs.mkdir(directory,{recursive:true});
const readJson = async (file, fallback) => { try { return JSON.parse(await fs.readFile(file,"utf8")); } catch (err) { if (err.code === "ENOENT") return fallback; throw err; } };
const dbFile = path.join(directory,"database.json");
let records = await readJson(dbFile,{});
const persist = async () => { await fs.writeFile(dbFile+".tmp",JSON.stringify(records)); await fs.rename(dbFile+".tmp",dbFile); };
const storage = new ChunkStorage({ get: async (key) => structuredClone(records[key]), put: async (key,value) => { records[key]=structuredClone(value); await persist(); }, delete: async (key) => { delete records[key]; await persist(); } });
const credentialFile = path.join(directory,"local-login.json");
let credentials = await readJson(credentialFile,null);
if (!credentials) { credentials = { username:"galasgrozs", password:`Vietne-${crypto.randomUUID()}!` }; await fs.writeFile(credentialFile,JSON.stringify(credentials,null,2)); }
const repoFile = path.join(directory,"repository.json");
let publication = await readJson(repoFile,null);
const mime = (filename) => ({html:"text/html",js:"text/javascript",mjs:"text/javascript",css:"text/css",json:"application/json",pdf:"application/pdf",svg:"image/svg+xml",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",webp:"image/webp"}[filename.split(".").pop()] || "application/octet-stream");
const safePath = (filename) => {
  if (filename.includes("..") || filename.includes("\\") || filename.startsWith("/") || !/^[a-zA-Z0-9_./-]+$/.test(filename)) throw new AppError("Fails nav atrasts.",404);
  return filename;
};
const repo = {
  async load() { return { sha:publication?.sha || "local-initial", store:publication?.store || JSON.parse(await fs.readFile(path.join(root,"data/store.json"),"utf8")) }; },
  async read(filename) { safePath(filename); if (publication?.files[filename]) return new TextEncoder().encode(publication.files[filename]); if (publication?.images[filename]) return new Uint8Array(Buffer.from(publication.images[filename],"base64")); return new Uint8Array(await fs.readFile(path.join(root,filename))); },
  async publish(store, expected, uploads) {
    if (expected !== (publication?.sha || "local-initial")) throw new AppError("Vietne ir mainīta citur.",409);
    const files=generatedFiles(store);
    for (const page of store.pages) files[page.file]=renderPage(new TextDecoder().decode(await repo.read(page.file)),page,store.site,`local-${Date.now()}`);
    publication={sha:`local-${crypto.randomUUID()}`,store,files,images:{...publication?.images,...Object.fromEntries(uploads.map((u)=>[u.path,u.base64]))}};
    await fs.writeFile(repoFile,JSON.stringify(publication)); return publication.sha;
  }
};
const env = { ADMIN_USER:credentials.username, ADMIN_PASSWORD_HASH:await passwordHash(credentials.password), LOCAL_MODE:"1", PUBLIC_SITE_URL:"https://www.galasgrozs.lv" };
const service = new AdminService(env,storage,repo);
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,"http://127.0.0.1:4174");
    const headers = new Headers(); for (const [key,value] of Object.entries(req.headers)) if (value) headers.set(key,Array.isArray(value)?value.join(","):value);
    let response;
    if(url.pathname.startsWith("/api/")||url.pathname.startsWith("/preview/")){
      const request=new Request(url,{method:req.method,headers,...(!["GET","HEAD"].includes(req.method)?{body:req,duplex:"half"}:{})});
      response=await service.fetch(request);
    }else if(url.pathname.startsWith("/live/")){
      const filename=safePath(url.pathname.slice(6)); response=new Response(await repo.read(filename),{headers:{"Content-Type":mime(filename)}});
    }else{
      const filename=url.pathname==="/"?"index.html":safePath(url.pathname.slice(1));
      if(!["index.html","app.js","style.css","fonts.css","guide-lv.pdf"].includes(filename))throw new AppError("Fails nav atrasts.",404);
      response=new Response(await fs.readFile(path.join(root,"admin/public",filename)),{headers:{"Content-Type":mime(filename)}});
    }
    res.statusCode=response.status; for(const[key,value]of response.headers)res.setHeader(key,value);
    res.setHeader("X-Content-Type-Options","nosniff"); res.setHeader("X-Robots-Tag","noindex, nofollow"); res.setHeader("Cache-Control","no-store");
    if(!url.pathname.startsWith("/preview/")&&!url.pathname.startsWith("/live/"))res.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){res.statusCode=error.status||404;res.end(error.status?error.message:"Fails nav atrasts.");}
});
server.listen(4174,"127.0.0.1",()=>console.log(`Local administration: http://127.0.0.1:4174\nLocal login saved in outputs/admin-local/local-login.json\nChanges stay in outputs/admin-local. The public website is never changed by this server.`));
