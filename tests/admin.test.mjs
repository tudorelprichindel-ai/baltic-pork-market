import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { AdminService, passwordHash } from "../admin/service.mjs";
import { validateStore, renderPage, generatedFiles, assertImage } from "../admin/shared.mjs";
import { ChunkStorage } from "../admin/storage.mjs";
import { GitHubRepository } from "../admin/github.mjs";
const initial=JSON.parse(await fs.readFile("data/store.json","utf8"));
async function fixture() {
  const records=new Map(); const kv={ get:async(k)=>structuredClone(records.get(k)),put:async(k,v)=>{records.set(k,structuredClone(v));},delete:async(k)=>records.delete(k) };
  const repo={sha:"a",store:structuredClone(initial),load:async()=>({sha:repo.sha,store:structuredClone(repo.store)}),read:async(p)=>new TextEncoder().encode(await fs.readFile(p,"utf8")),publish:async(store,expected)=>{assert.equal(expected,repo.sha);repo.store=structuredClone(store);repo.sha+="b";return repo.sha;}};
  const service=new AdminService({ADMIN_USER:"test",ADMIN_PASSWORD_HASH:await passwordHash("a-test-passphrase-strong"),LOCAL_MODE:"1",PUBLIC_SITE_URL:"https://www.galasgrozs.lv"},new ChunkStorage(kv),repo);
  let cookie="";
  async function request(path,body,extra={}) { const response=await service.fetch(new Request(`https://admin.example${path}`,{method:body===undefined?"GET":"POST",headers:{Origin:"https://admin.example","Content-Type":"application/json",Cookie:cookie,...extra},body:body===undefined?undefined:JSON.stringify(body)})); if(response.headers.get("Set-Cookie"))cookie=response.headers.get("Set-Cookie").split(";")[0]; return {status:response.status,body:await response.json(),headers:response.headers}; }
  return {request,repo,service,records};
}
test("catalog migration preserves approved products and all translations",()=>{
  validateStore(initial); assert.equal(initial.catalog.products.length,38);
  assert.equal(initial.catalog.products.find(p=>p.id==="skinless-chicken-gyros").name.ru,"Куриный гирос без кожи");
  assert.match(initial.catalog.products.find(p=>p.id==="pork-belly-with-rib").image,/thicker-v2/);
  for(const p of initial.catalog.products)for(const lang of["lv","en","ru"])assert.ok(p.name[lang]&&p.description[lang]);
});
test("validation prevents unsafe images, prices, promotions, duplicate ids and links",()=>{
  for(const mutate of [s=>s.catalog.products[0].image="javascript:alert(1)",s=>s.catalog.products[0].price=-1,s=>{s.catalog.products[0].promotion=true;s.catalog.products[0].salePrice=999;},s=>s.catalog.products[1].id=s.catalog.products[0].id,s=>s.site.instagramUrl="javascript:alert(1)",s=>s.catalog.products[0].name.ru="",s=>s.site.cardPaymentsEnabled=true]){const s=structuredClone(initial);mutate(s);assert.throws(()=>validateStore(s));}
  assert.throws(()=>assertImage(new Uint8Array(100),"image/svg+xml"));
});
test("secure authentication, cross-origin rejection, rate limits and logout",async()=>{
  const f=await fixture(); assert.equal((await f.request("/api/state")).status,401);
  assert.equal((await f.request("/api/login",{username:"test",password:"a-test-passphrase-strong"},{Origin:"https://evil.example"})).status,403);
  const login=await f.request("/api/login",{username:"test",password:"a-test-passphrase-strong"});assert.equal(login.status,200);assert.match(login.headers.get("Set-Cookie"),/HttpOnly; SameSite=Strict.*Secure/);
  assert.equal((await f.request("/api/state")).status,200);await f.request("/api/logout",{});assert.equal((await f.request("/api/state")).status,401);
  for(let i=0;i<5;i++)assert.equal((await f.request("/api/login",{username:"test",password:"wrong"})).status,401);
  assert.equal((await f.request("/api/login",{username:"test",password:"a-test-passphrase-strong"})).status,429);
});
test("drafts do not publish, stale tabs cannot overwrite, publish and restore",async()=>{
  const f=await fixture();await f.request("/api/login",{username:"test",password:"a-test-passphrase-strong"});
  const current=(await f.request("/api/state")).body; const store=structuredClone(current.store);store.catalog.products[0].price=9.25;
  const saved=await f.request("/api/draft",{revision:current.revision,store});assert.equal(saved.status,200);assert.notEqual(f.repo.store.catalog.products[0].price,9.25);
  assert.equal((await f.request("/api/draft",{revision:current.revision,store})).status,409);
  const published=await f.request("/api/publish",{revision:saved.body.revision});assert.equal(published.status,200);assert.equal(f.repo.store.catalog.products[0].price,9.25);
  const original=published.body.history.at(-1);const restored=await f.request("/api/restore",{revision:published.body.revision,id:original.id});assert.equal(restored.status,200);assert.equal(f.repo.store.catalog.products[0].price,9.25);assert.equal(restored.body.store.catalog.products[0].price,initial.catalog.products[0].price);
});
test("password changes revoke sessions and credential rotation recovers access",async()=>{
  const f=await fixture();await f.request("/api/login",{username:"test",password:"a-test-passphrase-strong"});
  assert.equal((await f.request("/api/password",{password:"wrong",newPassword:"new-long-test-passphrase"})).status,403);
  assert.equal((await f.request("/api/password",{password:"a-test-passphrase-strong",newPassword:"new-long-test-passphrase"})).status,200);
  assert.equal((await f.request("/api/state")).status,401);
  assert.equal((await f.request("/api/login",{username:"test",password:"a-test-passphrase-strong"})).status,401);
  assert.equal((await f.request("/api/login",{username:"test",password:"new-long-test-passphrase"})).status,200);
  f.service.env.ADMIN_PASSWORD_HASH=await passwordHash("recovered-test-passphrase");
  assert.equal((await f.request("/api/state")).status,401);
  assert.equal((await f.request("/api/login",{username:"test",password:"new-long-test-passphrase"})).status,401);
  assert.equal((await f.request("/api/login",{username:"test",password:"recovered-test-passphrase"})).status,200);
});
test("new categories and products can be published and safely archived on restore",async()=>{
  const f=await fixture();const login=await f.request("/api/login",{username:"test",password:"a-test-passphrase-strong"});
  const current=(await f.request("/api/state")).body;
  const image=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=","base64");
  const uploaded=await f.service.fetch(new Request("https://admin.example/api/upload",{method:"POST",headers:{Origin:"https://admin.example",Cookie:login.headers.get("Set-Cookie").split(";")[0],"Content-Type":"image/png"},body:image}));
  assert.equal(uploaded.status,200);const path=(await uploaded.json()).path;
  const store=structuredClone(current.store);store.catalog.categories.push({...store.catalog.categories[0],id:"new-category"});
  store.catalog.products.push({...store.catalog.products[0],id:"new-product",category:"new-category",image:path,active:true});
  const saved=await f.request("/api/draft",{revision:current.revision,store});assert.equal(saved.status,200);
  const published=await f.request("/api/publish",{revision:saved.body.revision});assert.equal(published.status,200);
  const restored=await f.request("/api/restore",{revision:published.body.revision,id:current.history[0].id});assert.equal(restored.status,200);
  assert.equal(restored.body.store.catalog.products.find(p=>p.id==="new-product").active,false);assert.equal(restored.body.store.catalog.categories.find(p=>p.id==="new-category").active,false);
  assert.equal((await f.request("/api/publish",{revision:restored.body.revision})).status,200);
});
test("GitHub publisher creates one atomic commit and refuses a changed branch",async(t)=>{
  const calls=[];t.mock.method(globalThis,"fetch",async(url,options={})=>{
    const path=new URL(url).pathname;const method=options.method||"GET";const body=options.body?JSON.parse(options.body):null;calls.push({path,method,body});
    if(path.endsWith("/git/ref/heads/main"))return Response.json({object:{sha:"expected"}});
    if(path.includes("/contents/")){const filename=path.split("/contents/")[1];return Response.json({encoding:"base64",content:Buffer.from(await fs.readFile(filename)).toString("base64")});}
    if(path.endsWith("/git/commits/expected"))return Response.json({tree:{sha:"parent-tree"}});
    if(path.endsWith("/git/blobs"))return Response.json({sha:"image-blob"});
    if(path.endsWith("/git/trees")){assert.equal(body.base_tree,"parent-tree");assert.equal(body.tree.find(f=>f.path==="assets/products/admin-test.png").sha,"image-blob");assert.ok(body.tree.find(f=>f.path==="data/store.json"));return Response.json({sha:"new-tree"});}
    if(path.endsWith("/git/commits")){assert.deepEqual(body.parents,["expected"]);assert.equal(body.tree,"new-tree");return Response.json({sha:"new-commit"});}
    if(method==="PATCH"){assert.deepEqual(body,{sha:"new-commit",force:false});return Response.json({object:{sha:"new-commit"}});}
    throw new Error("Unexpected GitHub call "+path);
  });
  const repo=new GitHubRepository({GITHUB_TOKEN:"test-token",GITHUB_REPOSITORY:"owner/repo"});
  assert.equal(await repo.publish(initial,"expected",[{path:"assets/products/admin-test.png",base64:"test"}]),"new-commit");assert.equal(calls.filter(c=>c.method==="PATCH").length,1);
  calls.length=0;await assert.rejects(()=>repo.publish(initial,"changed",[]),err=>err.status===409);assert.equal(calls.length,1);
});
test("all page anchors survive generation and delivery settings are shared",async()=>{
  for(const page of initial.pages){const html=await fs.readFile(page.file,"utf8");for(const field of page.fields)if(!field.id.startsWith("seo-"))assert.ok(html.includes(`data-content-id="${field.id}"`),`${page.file} ${field.id}`);
    const store=structuredClone(initial);store.site.phone="+371 20000000";store.site.orderDays.lv="Sestdiena";store.site.freeDeliveryThreshold=75;const result=renderPage(html,page,store.site,"test");assert.ok(!result.includes('href="tel:+37129174626"'));if(page.fields.some(f=>f.business==="orderDays"))assert.ok(result.includes("Sestdiena"));
  }
  const files=generatedFiles(initial);assert.deepEqual(JSON.parse(files["data/store.json"]),initial);
});
test("large Unicode documents survive chunked persistence and cleanup",async()=>{
  const map=new Map();const storage=new ChunkStorage({get:async(k)=>map.get(k),put:async(k,v)=>{assert.ok(JSON.stringify(v).length<128000);map.set(k,v);},delete:async(k)=>map.delete(k)});
  const value={text:"āЖ🙂".repeat(200000)};await storage.put("large",value);assert.deepEqual(await storage.get("large"),value);await storage.put("large",{text:"small"});assert.equal(map.size,1);await storage.delete("large");assert.equal(map.size,0);
});
