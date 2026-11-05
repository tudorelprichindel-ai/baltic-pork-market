// Exercises the real Workers runtime and SQLite-backed Durable Object locally.
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import {createRequire} from "node:module";
import { passwordHash } from "../admin/service.mjs";
const runtimeRequire=createRequire(await fs.realpath("outputs/admin-runtime/node_modules/wrangler/bin/wrangler.js"));
const {Miniflare,convertV4MiniflareOptions}=await import(pathToFileURL(runtimeRequire.resolve("miniflare")));
const mf=new Miniflare(convertV4MiniflareOptions({workers:[{
  name:"admin-test",
  modules:true,scriptPath:path.resolve("admin/outputs/admin-worker-build/worker.js"),compatibilityDate:"2026-11-05",
  durableObjects:{ADMIN:{className:"Administration",useSQLite:true}},
  bindings:{ADMIN_USER:"runtime-test",ADMIN_PASSWORD_HASH:await passwordHash("runtime-test-passphrase"),GITHUB_TOKEN:"fixture-token",GITHUB_REPOSITORY:"fixture/site",GITHUB_BRANCH:"main",PUBLIC_SITE_URL:"https://www.galasgrozs.lv"},
  outboundService:async(request)=>{
    const url=new URL(request.url);
    if(url.hostname!=="api.github.com")return new Response("Unexpected network request",{status:500});
    if(url.pathname.endsWith("/git/ref/heads/main"))return Response.json({object:{sha:"fixture-head"}});
    if(url.pathname.endsWith("/contents/data/store.json"))return Response.json({encoding:"base64",content:Buffer.from(await fs.readFile("data/store.json")).toString("base64")});
    return new Response("Unexpected fixture route",{status:500});
  }
}]}));
try{
  const base="https://admin.example";
  const login=await mf.dispatchFetch(`${base}/api/login`,{method:"POST",headers:{Origin:base,"Content-Type":"application/json"},body:JSON.stringify({username:"runtime-test",password:"runtime-test-passphrase"})});
  assert.equal(login.status,200,await login.text());const cookie=login.headers.get("Set-Cookie").split(";")[0];
  const current=await mf.dispatchFetch(`${base}/api/state`,{headers:{Cookie:cookie}});assert.equal(current.status,200,await current.clone().text());const state=await current.json();
  state.store.catalog.products[0].price=9.99;
  const saved=await mf.dispatchFetch(`${base}/api/draft`,{method:"POST",headers:{Origin:base,Cookie:cookie,"Content-Type":"application/json"},body:JSON.stringify({revision:state.revision,store:state.store})});
  assert.equal(saved.status,200,await saved.clone().text());assert.equal((await saved.json()).store.catalog.products[0].price,9.99);
  assert.match(saved.headers.get("Content-Security-Policy"),/default-src 'self'/);
  console.log("Workers runtime passed: secure login, GitHub fixture import, SQLite chunked storage and saving a complete draft.");
}finally{await mf.dispose();}
